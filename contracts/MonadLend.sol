// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadLend is ReentrancyGuard, Ownable {
    IERC20 public usdt;
    uint256 public monRate; // 1 MON = ? USDT (18 decimals)
    uint256 public platformFeeRate = 100;

    struct LendingOffer {
        uint256 id; // Offer id
        address lender; // Lender
        uint256 usdtAmount; // USDT Amount
        uint256 collateralRate; // Collateral Rate (100 = %100)
        uint256 interestRate; // Interest Rate (1000 = %10)
        uint256 duration; // Duration in minutes
        uint256 requiredMon; // Required MON collateral amount
        bool isActive; // Is offer active?
    }

    struct Loan {
        uint256 id; // Loan id
        address lender; // Lender
        address borrower; // Borrower
        uint256 usdtAmount; // USDT Amount
        uint256 monAmount; // Monad Collateral Amount
        uint256 collateralRate; // Collateral Rate
        uint256 interestRate; // Interest Rate
        uint256 startTime; // Start Time
        uint256 duration; // Duration in minutes
        bool isActive; // Is Loan Active?
        bool isRepaid; // Is Loan Repaid?
    }

    uint256 public offerCount; // lending offer count
    uint256 public loanCount; // borrowed loan count

    mapping(uint256 => LendingOffer) public lendingOffers;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;

    event RateUpdated(uint256 newRate);
    event OfferCreated(
        uint256 indexed offerId,
        address lender,
        uint256 usdtAmount,
        uint256 requiredMon
    );
    event LoanCreated(
        uint256 indexed loanId,
        address borrower,
        address lender,
        uint256 monAmount
    );
    event LoanRepaid(uint256 indexed loanId, uint256 repayAmount);
    event CollateralClaimed(uint256 indexed loanId, uint256 monAmount);
    event EmergencyWithdraw(address token, uint256 amount);
    event OfferCancelled(
        uint256 indexed offerId,
        address lender,
        uint256 usdtAmount
    );
    event PlatformFeeRateUpdated(uint256 newRate);
    event PlatformFeePaid(uint256 indexed offerId, uint256 feeAmount);
    event PlatformFeesWithdrawn(uint256 amount);

    constructor(address _usdt) Ownable(msg.sender) {
        usdt = IERC20(_usdt);
        monRate = 1e18; // 1 MON = 1 USDT
    }

    // Update MON/USDT rate
    function setMonRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Invalid rate");

        monRate = newRate;
        emit RateUpdated(newRate);
    }

    // Update Platform Fee
    function setPlatformFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newRate;
        emit PlatformFeeRateUpdated(_newRate);
    }

    // Calculate the required MON collateral amount
    function calculateRequiredMon(
        uint256 _usdtAmount,
        uint256 _collateralRate
    ) public view returns (uint256) {
        return (_usdtAmount * _collateralRate * 1e18) / (monRate * 100);
    }

    // Create a loan offer
    function createOffer(
        uint256 _usdtAmount,
        uint256 _collateralRate,
        uint256 _interestRate,
        uint256 _duration
    ) external nonReentrant {
        require(_usdtAmount > 0, "Amount must be > 0");
        require(_collateralRate >= 100, "Collateral rate must be >= 100%");
        require(
            _interestRate > 0 && _interestRate <= 5000,
            "Invalid interest rate"
        ); // max 50%
        require(_duration > 0 && _duration <= 525600, "Invalid duration"); // max 1 year in minutes (365 * 24 * 60)

        uint256 platformFee = (_usdtAmount * platformFeeRate) / 10000;
        uint256 totalAmount = _usdtAmount + platformFee;

        // Transfer total amount (offer amount + fee) from user
        usdt.transferFrom(msg.sender, address(this), totalAmount);
        offerCount++;

        // Calculate requiredMonAmount
        uint256 requiredMonAmount = calculateRequiredMon(
            _usdtAmount,
            _collateralRate
        );

        lendingOffers[offerCount] = LendingOffer({
            id: offerCount,
            lender: msg.sender,
            usdtAmount: _usdtAmount,
            collateralRate: _collateralRate,
            interestRate: _interestRate,
            duration: _duration,
            requiredMon: requiredMonAmount,
            isActive: true
        });

        emit OfferCreated(
            offerCount,
            msg.sender,
            _usdtAmount,
            requiredMonAmount
        );
        emit PlatformFeePaid(offerCount, platformFee);
    }

    // Borrow money (If there is enough mon, usdt can borrow it.)
    function borrowFromOffer(uint256 _offerId) external payable nonReentrant {
        LendingOffer storage offer = lendingOffers[_offerId];
        require(offer.isActive, "Offer not active");
        require(msg.value >= offer.requiredMon, "Insufficient collateral");

        loanCount++;
        loans[loanCount] = Loan({
            id: loanCount,
            lender: offer.lender,
            borrower: msg.sender,
            usdtAmount: offer.usdtAmount,
            monAmount: msg.value,
            collateralRate: offer.collateralRate,
            interestRate: offer.interestRate,
            startTime: block.timestamp,
            duration: offer.duration,
            isActive: true,
            isRepaid: false
        });

        userLoans[msg.sender].push(loanCount);

        usdt.transfer(msg.sender, offer.usdtAmount); // transfer usdt to msg.sender
        offer.isActive = false;

        emit LoanCreated(loanCount, msg.sender, offer.lender, msg.value);
    }

    // Repay Loan
    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.isActive, "Loan not active"); // time-out
        require(msg.sender == loan.borrower, "Not the borrower");
        require(
            block.timestamp <= loan.startTime + (loan.duration * 1 minutes),
            "Loan expired"
        );

        uint256 interest = (loan.usdtAmount * loan.interestRate) / 1000;
        uint256 totalRepayment = loan.usdtAmount + interest;

        // Pay your loan to the person you borrowed money from
        usdt.transferFrom(msg.sender, loan.lender, totalRepayment);

        // Repay the borrower the mon's he/she used as collateral.
        (bool sent, ) = loan.borrower.call{value: loan.monAmount}("");
        require(sent, "Failed to return collateral");

        loan.isActive = false;
        loan.isRepaid = true; // The loan has been successfully repaid.
        emit LoanRepaid(_loanId, totalRepayment);
    }

    // Request the Collateral
    function claimCollateral(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.isActive, "Loan not active");
        require(msg.sender == loan.lender, "Not the lender");
        require(
            block.timestamp > loan.startTime + (loan.duration * 1 minutes),
            "Loan not expired"
        );

        // Lender take the mon collateral
        (bool sent, ) = loan.lender.call{value: loan.monAmount}("");
        require(sent, "Failed to transfer collateral");

        loan.isActive = false;
        loan.isRepaid = false; // The loan was not repaid, collateral was taken.
        emit CollateralClaimed(_loanId, loan.monAmount);
    }

    function cancelOffer(uint256 _offerId) external nonReentrant {
        LendingOffer storage offer = lendingOffers[_offerId];
        require(offer.isActive, "Offer not active");
        require(msg.sender == offer.lender, "Not the offer creator");

        // Transfer only the original amount back to lender (fee is kept by platform)
        require(usdt.transfer(msg.sender, offer.usdtAmount), "Transfer failed");

        offer.isActive = false;

        emit OfferCancelled(_offerId, msg.sender, offer.usdtAmount);
    }

    function getActiveOffers() external view returns (LendingOffer[] memory) {
        // First find the number of active offers
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= offerCount; i++) {
            if (lendingOffers[i].isActive) {
                activeCount++;
            }
        }

        // Create an array containing active offers
        LendingOffer[] memory activeOffers = new LendingOffer[](activeCount);
        uint256 currentIndex = 0;

        // Fill active offers
        for (uint256 i = 1; i <= offerCount; i++) {
            if (lendingOffers[i].isActive) {
                activeOffers[currentIndex] = lendingOffers[i];
                currentIndex++;
            }
        }

        return activeOffers;
    }

    // Bring user loans
    function getUserLoans(address _user) external view returns (Loan[] memory) {
        uint256[] memory userLoanIds = userLoans[_user];
        Loan[] memory userLoanDetails = new Loan[](userLoanIds.length);

        for (uint256 i = 0; i < userLoanIds.length; i++) {
            Loan storage loan = loans[userLoanIds[i]];
            require(loan.id == userLoanIds[i], "Loan ID mismatch");
            require(loan.borrower == _user, "Loan borrower mismatch");
            userLoanDetails[i] = loan;
        }

        return userLoanDetails;
    }

    // Emergency Functions
    function emergencyWithdrawMon() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No Mon to withdraw");

        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to withdraw Mon");

        emit EmergencyWithdraw(address(0), balance);
    }

    function emergencyWithdrawUsdt() external onlyOwner {
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No Usdt to withdraw");

        require(usdt.transfer(owner(), balance), "Failed to withdraw Usdt");
        emit EmergencyWithdraw(address(usdt), balance);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");

        require(usdt.transfer(owner(), balance), "Transfer failed");
        emit PlatformFeesWithdrawn(balance);
    }

    fallback() external payable {}
    receive() external payable {}
}
