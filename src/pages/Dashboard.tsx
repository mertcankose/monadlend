// @ts-nocheck
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { ethers, BrowserProvider } from "ethers";
import { Edit, Info, RefreshCw, Send, Star, Wallet } from "lucide-react";
import backgroundImage from "@/assets/bg-image.png";
import { usdtTokenAbi, monadLendAbi } from "@/assets/abis";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "@/assets/logo.png";
import { errorMessage, successMessage } from "@/helpers/toast";
import { Link } from "react-router-dom";

const projectId = "de1b2a6fb146e4cb4ddf971cfc94acc2";

const metadata = {
  name: "monadlend",
  description: "Monadlend",
  url: "https://monadlend.hiddenz.one/",
  icons: ["https://monadlend.hiddenz.one/logo.png"],
};

const monadtestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [monadtestnet],
  metadata,
  projectId,
  themeMode: "light",
  features: {
    analytics: true,
  },
  themeVariables: {
    "--w3m-accent": "#836EF9",
  },
});

const Dashboard = () => {
  /* Contract Addresses */
  const USDT_TOKEN_ADDRESS = "0x7f1a73274F45cCaa2d39E9406DE916Cb575b0566";
  const MONADLEND_ADDRESS = "0x091C0022771770aA56F1ACd8d7eB0b2BA9ff8116";

  /* AppKit */
  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();

  /* Balances */
  const [monadBalance, setMonadBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");

  const [provider, setProvider] = useState(null);

  /* Contracts */
  const [usdtTokenContract, setUsdtTokenContract] = useState(null);
  const [monadLendContract, setMonadLendContract] = useState(null);

  /* Offers, Loans */
  const [activeOffers, setActiveOffers] = useState([]);
  const [userLoans, setUserLoans] = useState([]);
  const [repayingLoans, setRepayingLoans] = useState({});
  const [lendingValues, setLendingValues] = useState({
    usdtAmount: "",
    collateralRate: "",
    interestRate: "",
    duration: "",
  });

  /* States */
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [borrowingStates, setBorrowingStates] = useState({});
  const [cancellingStates, setCancellingStates] = useState({});
  const [claimingStates, setClaimingStates] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* All Offers */
  const [allOffers, setAllOffers] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    if (isConnected && walletProvider) {
      const newProvider = new BrowserProvider(walletProvider);
      setProvider(newProvider);
    } else {
      setProvider(null);
    }
  }, [isConnected, walletProvider]);

  useEffect(() => {
    if (isConnected && provider) {
      fetchBalances();
    }
  }, [isConnected, provider, address]);

  useEffect(() => {
    initContracts();
  }, [address, isConnected, provider]);

  useEffect(() => {
    if (monadLendContract && address) {
      fetchActiveOffers();
      fetchUserLoans();
      fetchAllOffers();
    }
  }, [monadLendContract, address]);

  /* Initialize Contracts */
  const initContracts = async () => {
    try {
      if (!isConnected || !provider) {
        setUsdtTokenContract(null);
        setMonadLendContract(null);
        return;
      }

      const signer = await provider.getSigner();
      const newUsdtTokenContract = new ethers.Contract(USDT_TOKEN_ADDRESS, usdtTokenAbi, signer);
      const newMonadLendContract = new ethers.Contract(MONADLEND_ADDRESS, monadLendAbi, signer);

      setUsdtTokenContract(newUsdtTokenContract);
      setMonadLendContract(newMonadLendContract);
    } catch (err) {
      console.error("Contract initialization error:", err);
      setUsdtTokenContract(null);
      setMonadLendContract(null);
    }
  };

  /* Fetch Balances */
  const fetchBalances = async () => {
    try {
      if (!isConnected || !provider || !usdtTokenContract) return;
      const monadBal = await provider.getBalance(address);
      const usdtBal = await usdtTokenContract.balanceOf(address);
      setMonadBalance(ethers.formatEther(monadBal));
      setUsdtBalance(ethers.formatEther(usdtBal));
    } catch (err) {
      console.error("Balance fetch error:", err);
      setMonadBalance("0");
      setUsdtBalance("0");
    }
  };

  /* Fetch Active Offers */
  const fetchActiveOffers = async () => {
    if (!monadLendContract) return;
    try {
      const offers = await monadLendContract.getActiveOffers();
      setActiveOffers(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setActiveOffers([]);
    }
  };

  /* Fetch User Loans */
  const fetchUserLoans = async () => {
    if (!monadLendContract || !address) return;
    console.log("fetching user loans");
    try {
      // Get all loans
      const allLoans = [];
      const loanCount = await monadLendContract.loanCount();

      console.log("loanCount:", loanCount);

      for (let i = 1; i <= loanCount; i++) {
        const loan = await monadLendContract.loans(i);
        console.log("loan:", loan);
        // Include loans where user is either the borrower or the lender
        if (
          loan.borrower.toLowerCase() === address.toLowerCase() ||
          loan.lender.toLowerCase() === address.toLowerCase()
        ) {
          allLoans.push(loan);
        }
      }

      setUserLoans(allLoans);
    } catch (error) {
      console.error("Error fetching user loans:", error);
      setUserLoans([]);
    }
  };

  /* Fetch All Offers */
  const fetchAllOffers = async () => {
    if (!monadLendContract) return;
    try {
      const offers = [];
      for (let i = 1; i <= (await monadLendContract.offerCount()); i++) {
        const offer = await monadLendContract.lendingOffers(i);
        offers.push(offer);
      }
      setAllOffers(offers);
    } catch (error) {
      console.error("Error fetching all offers:", error);
      setAllOffers([]);
    }
  };

  /* Create Offer */
  const handleCreateOffer = async () => {
    setIsCreatingOffer(true);
    try {
      const usdtAmount = ethers.parseUnits(lendingValues.usdtAmount, 18);
      const currentAllowance = await usdtTokenContract.allowance(address, MONADLEND_ADDRESS);

      if (currentAllowance < BigInt(usdtAmount.toString())) {
        const approveTx = await usdtTokenContract.approve(MONADLEND_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
        successMessage("Token approval successful");
      }

      const collateralRate = Number(lendingValues.collateralRate);
      const interestRate = Number(lendingValues.interestRate) * 100;
      const duration = Number(lendingValues.duration);

      const tx = await monadLendContract.createOffer(usdtAmount, collateralRate, interestRate, duration);
      await tx.wait();
      await fetchActiveOffers();
      await fetchBalances();
      successMessage("Lending offer created successfully");

      setLendingValues({
        usdtAmount: "",
        collateralRate: "",
        interestRate: "",
        duration: "",
      });
    } catch (error) {
      console.error("Create offer error:", error);
      errorMessage("Failed to create lending offer");
    } finally {
      setIsCreatingOffer(false);
    }
  };

  /* Cancel Offer */
  const handleCancelOffer = async (offerId) => {
    setCancellingStates((prev) => ({ ...prev, [offerId]: true }));
    try {
      const tx = await monadLendContract.cancelOffer(offerId);
      await tx.wait();
      await fetchActiveOffers();
      await fetchBalances();
      successMessage("Offer cancelled successfully");
    } catch (error) {
      console.error("Cancel offer error:", error);
      errorMessage("Failed to cancel offer");
    } finally {
      setCancellingStates((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  /* Borrow From Offer */
  const handleBorrowFromOffer = async (offerId) => {
    setBorrowingStates((prev) => ({ ...prev, [offerId]: true }));
    try {
      const offer = allOffers.find((offer) => offer.id.toString() === offerId.toString());
      if (!offer) {
        errorMessage("Offer not found");
        return;
      }

      const tx = await monadLendContract.borrowFromOffer(offer.id, {
        value: offer.requiredMon,
      });
      await tx.wait();
      await Promise.all([fetchUserLoans(), fetchBalances(), fetchActiveOffers(), fetchAllOffers()]);
      successMessage("Successfully borrowed from offer");
    } catch (error) {
      console.error("Borrow error:", error);
      errorMessage("Failed to borrow from offer");
    } finally {
      setBorrowingStates((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  /* Repay Loan */
  const handleRepayLoan = async (loanId) => {
    setRepayingLoans((prev) => ({ ...prev, [loanId]: true }));
    try {
      const loan = userLoans.find((loan) => loan.id.toString() === loanId.toString());
      if (!loan) {
        errorMessage("Loan not found");
        return;
      }

      const interest = (BigInt(loan.usdtAmount) * BigInt(loan.interestRate)) / BigInt(1000);
      const totalRepayment = BigInt(loan.usdtAmount) + interest;

      // Check USDT balance
      const userBalance = await usdtTokenContract.balanceOf(address);
      if (userBalance < totalRepayment) {
        errorMessage(`Insufficient USDT balance. Need ${ethers.formatEther(totalRepayment)} USDT`);
        return;
      }

      const currentAllowance = await usdtTokenContract.allowance(address, MONADLEND_ADDRESS);
      if (currentAllowance < totalRepayment) {
        const approveTx = await usdtTokenContract.approve(MONADLEND_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
        successMessage("Token approval successful");
      }

      const tx = await monadLendContract.repayLoan(loan.id);
      await tx.wait();
      await Promise.all([fetchUserLoans(), fetchBalances(), fetchActiveOffers()]);
      successMessage("Loan repaid successfully");
    } catch (error) {
      console.error("Repay error:", error);
      errorMessage("Failed to repay loan");
    } finally {
      setRepayingLoans((prev) => ({ ...prev, [loanId]: false }));
    }
  };

  /* Claim Collateral */
  const handleClaimCollateral = async (loanId) => {
    setClaimingStates((prev) => ({ ...prev, [loanId]: true }));
    try {
      const loan = userLoans.find((loan) => loan.id.toString() === loanId.toString());
      if (!loan) {
        errorMessage("Loan not found");
        return;
      }

      const tx = await monadLendContract.claimCollateral(loan.id);
      await tx.wait();
      await Promise.all([fetchUserLoans(), fetchBalances(), fetchActiveOffers(), fetchAllOffers()]);
      successMessage("Successfully claimed collateral");
    } catch (error) {
      console.error("Claim collateral error:", error);
      const errorMsg = error.message || "Failed to claim collateral";
      if (errorMsg.includes("execution reverted")) {
        const reason = errorMsg.split("execution reverted:")[1]?.trim() || "Unknown error";
        errorMessage(`Transaction failed: ${reason}`);
      } else {
        errorMessage(errorMsg);
      }
    } finally {
      setClaimingStates((prev) => ({ ...prev, [loanId]: false }));
    }
  };

  /* Refresh Data */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchUserLoans(), fetchActiveOffers(), fetchAllOffers(), fetchBalances()]);
      successMessage("Data refreshed successfully");
    } catch (error) {
      console.error("Refresh error:", error);
      errorMessage("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className="min-h-screen relative text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        colorScheme: "light",
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <header className="bg-transparent" data-aos="fade-down">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="w-36 h-36" />
          </Link>

          <appkit-button balance="show" label="Connect Wallet" size="md" loadingLabel="Connecting.." />
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12 relative">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-4" data-aos="fade-right">
            <Card className="border border-[#836EF9]/20 shadow-xl bg-white/5 backdrop-blur-sm text-white">
              <CardHeader className="bg-white/5 rounded-t-lg border-b border-[#836EF9]/20">
                <div className="flex items-center space-x-2 p-2">
                  <h2 className="text-xl font-bold text-black">P2P Meme Token Lending Platform</h2>
                </div>
                <Tabs defaultValue="borrow" className="w-full">
                  <TabsList className="grid w-full max-w-[600px] grid-cols-3">
                    <TabsTrigger
                      value="borrow"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#836EF9] data-[state=active]:to-[#9B88FF] data-[state=active]:text-white"
                    >
                      Borrow
                    </TabsTrigger>
                    <TabsTrigger
                      value="lending"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#836EF9] data-[state=active]:to-[#9B88FF] data-[state=active]:text-white"
                    >
                      Lending
                    </TabsTrigger>
                    <TabsTrigger
                      value="myloans"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#836EF9] data-[state=active]:to-[#9B88FF] data-[state=active]:text-white"
                    >
                      My Loans
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="lending" className="mt-6">
                    <div className="space-y-6">
                      {/* Create Offer Form */}
                      <div className="bg-white/5 p-6 rounded-lg shadow-md border border-[#836EF9]/20">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-[#836EF9] mb-2">Create Lending Offer</h3>
                          <p className="text-sm text-gray-900">Fill in the details to create your lending offer</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-1.5">
                            <label className="text-sm text-gray-900 font-medium">Amount (USDT)</label>
                            <Input
                              type="number"
                              value={lendingValues.usdtAmount}
                              onChange={(e) => setLendingValues({ ...lendingValues, usdtAmount: e.target.value })}
                              placeholder="100"
                              className="bg-[#836EF9]/10 border-[#836EF9]/30 text-gray-900 placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-700 ml-1.5">Enter the amount of USDT you want to lend</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm text-gray-900 font-medium">Collateral Rate (%)</label>
                            <Input
                              type="number"
                              value={lendingValues.collateralRate}
                              onChange={(e) => setLendingValues({ ...lendingValues, collateralRate: e.target.value })}
                              placeholder="150"
                              className="bg-[#836EF9]/10 border-[#836EF9]/30 text-gray-900 placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-700 ml-1.5">
                              Example: 150 means borrower needs to deposit 150% collateral (MON)
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm text-gray-900 font-medium">Interest Rate (%)</label>
                            <Input
                              type="number"
                              value={lendingValues.interestRate}
                              onChange={(e) => setLendingValues({ ...lendingValues, interestRate: e.target.value })}
                              placeholder="10"
                              className="bg-[#836EF9]/10 border-[#836EF9]/30 text-gray-900 placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-700 ml-1.5">
                              Annual interest rate (e.g., 10 means 10% APR)
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm text-gray-900 font-medium">Duration (minutes)</label>
                            <Input
                              type="number"
                              value={lendingValues.duration}
                              onChange={(e) => setLendingValues({ ...lendingValues, duration: e.target.value })}
                              placeholder="30"
                              className="bg-[#836EF9]/10 border-[#836EF9]/30 text-gray-900 placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-700 ml-1.5">
                              Loan duration in minutes (max: 525600 = 1 year)
                            </p>
                          </div>
                        </div>

                        {/* Fee Summary */}
                        <div className="mb-4 p-4 bg-[#836EF9]/5 rounded-lg border border-[#836EF9]/20">
                          <h4 className="text-sm font-semibold text-[#836EF9] mb-2">Summary</h4>
                          <div className="space-y-2">
                            <div className="flex flex-col lg:flex-row justify-between text-sm">
                              <span className="text-gray-800">Lending Amount:</span>
                              <span className="text-gray-900 font-medium">{lendingValues.usdtAmount || "0"} USDT</span>
                            </div>
                            <div className="flex flex-col lg:flex-row justify-between text-sm">
                              <span className="text-[#836EF9]">Platform Fee (1%):</span>
                              <span className="text-[#836EF9] font-medium">
                                {lendingValues.usdtAmount ? (Number(lendingValues.usdtAmount) * 0.01).toFixed(5) : "0"}{" "}
                                USDT
                              </span>
                            </div>
                            <div className="flex flex-col lg:flex-row justify-between text-sm font-bold pt-2 border-t border-[#836EF9]/20">
                              <span className="text-gray-900">Total Required:</span>
                              <span className="text-gray-900">
                                {lendingValues.usdtAmount ? (Number(lendingValues.usdtAmount) * 1.01).toFixed(5) : "0"}{" "}
                                USDT
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Loan Terms Preview */}
                        {lendingValues.usdtAmount &&
                          lendingValues.interestRate &&
                          lendingValues.duration &&
                          lendingValues.collateralRate && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-[#836EF9]/10 to-[#9B88FF]/10 rounded-lg border border-[#836EF9]/30">
                              <div className="flex items-center space-x-2 mb-3">
                                <Info className="w-4 h-4 text-[#836EF9]" />
                                <h4 className="text-sm font-semibold text-[#836EF9]">Loan Terms Preview</h4>
                              </div>
                              <div className="space-y-3">
                                <div className="bg-white/10 p-3 rounded-lg border border-[#836EF9]/20">
                                  <p className="text-xs text-gray-700 mb-2">
                                    <span className="font-semibold text-[#836EF9]">
                                      Required Collateral from Borrower:
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    Borrower must deposit{" "}
                                    <span className="font-bold text-[#836EF9]">
                                      {parseFloat(
                                        (
                                          (Number(lendingValues.usdtAmount) * Number(lendingValues.collateralRate)) /
                                          100
                                        ).toFixed(5)
                                      )}{" "}
                                      MON
                                    </span>{" "}
                                    as collateral ({Number(lendingValues.collateralRate)}% of {lendingValues.usdtAmount}{" "}
                                    USDT)
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">* Based on current rate: 1 MON ≈ 1 USDT</p>
                                </div>

                                <div className="bg-white/10 p-3 rounded-lg border border-[#836EF9]/20">
                                  <p className="text-xs text-gray-700 mb-2">
                                    <span className="font-semibold text-[#836EF9]">Repayment Details:</span>
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    Borrower will receive{" "}
                                    <span className="font-bold text-green-600">{lendingValues.usdtAmount} USDT</span>
                                  </p>
                                  <p className="text-sm text-gray-900 mt-1">
                                    Borrower must repay{" "}
                                    <span className="font-bold text-red-600">
                                      {parseFloat(
                                        (
                                          Number(lendingValues.usdtAmount) *
                                          (1 + (Number(lendingValues.interestRate) * 100) / 10000)
                                        ).toFixed(5)
                                      )}{" "}
                                      USDT
                                    </span>{" "}
                                    within{" "}
                                    {(() => {
                                      const totalMinutes = Number(lendingValues.duration);
                                      const days = Math.floor(totalMinutes / 1440);
                                      const hours = Math.floor((totalMinutes % 1440) / 60);
                                      const minutes = totalMinutes % 60;

                                      const parts = [];
                                      if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
                                      if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
                                      if (minutes > 0 || parts.length === 0)
                                        parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

                                      return parts.join(" ");
                                    })()}
                                  </p>
                                </div>

                                <div className="bg-white/10 p-3 rounded-lg border border-[#836EF9]/20">
                                  <p className="text-xs text-gray-700 mb-2">
                                    <span className="font-semibold text-[#836EF9]">Your Profit:</span>
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    You will earn{" "}
                                    <span className="font-bold text-green-600">
                                      {parseFloat(
                                        (
                                          Number(lendingValues.usdtAmount) *
                                          ((Number(lendingValues.interestRate) * 100) / 10000)
                                        ).toFixed(5)
                                      )}{" "}
                                      USDT
                                    </span>{" "}
                                    as interest ({Number(lendingValues.interestRate) / 100}%)
                                  </p>
                                </div>

                                <div className="bg-red-50/10 p-3 rounded-lg border border-red-500/30">
                                  <p className="text-xs text-gray-700 mb-2">
                                    <span className="font-semibold text-red-400">If Borrower Doesn't Repay:</span>
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    You can claim the{" "}
                                    <span className="font-bold text-red-400">
                                      {parseFloat(
                                        (
                                          (Number(lendingValues.usdtAmount) * Number(lendingValues.collateralRate)) /
                                          100
                                        ).toFixed(5)
                                      )}{" "}
                                      MON
                                    </span>{" "}
                                    collateral after the loan period expires
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Fee Info Box */}
                        <div className="mb-4 p-4 bg-[#836EF9]/5 rounded-lg border border-[#836EF9]/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Info className="w-4 h-4 text-[#836EF9]" />
                            <h4 className="text-sm font-semibold text-[#836EF9]">Platform Fee Info</h4>
                          </div>
                          <p className="text-xs text-gray-700">
                            • Platform charges 1% fee on the lending amount
                            <br />
                            • You can cancel your offer anytime before it's borrowed
                            <br />• If you cancel, you'll get your USDT back (excluding platform fee)
                          </p>
                        </div>

                        <Button
                          onClick={handleCreateOffer}
                          disabled={isCreatingOffer}
                          className="w-full bg-gradient-to-r from-[#836EF9] to-[#9B88FF] h-12 text-white font-semibold cursor-pointer"
                        >
                          {isCreatingOffer ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </div>
                          ) : (
                            "Create Offer"
                          )}
                        </Button>
                      </div>

                      {/* Active Offers List */}
                      <div className="space-y-4">
                        {activeOffers.map((offer) =>
                          offer.lender.toLowerCase() === address?.toLowerCase() ? (
                            <div key={offer.id} className="bg-white/5 p-6 rounded-lg border border-[#836EF9]/20">
                              <div className="flex items-center justify-between pb-4 border-b border-[#836EF9]/20">
                                <div className="flex items-center space-x-2">
                                  <Wallet className="w-5 h-5 text-[#836EF9]" />
                                  <p className="text-sm text-gray-800">
                                    {offer.lender.toLowerCase() === address?.toLowerCase()
                                      ? "Your Offer"
                                      : `Lender: ${offer.lender?.slice(0, 6)}...${offer.lender?.slice(-4)}`}
                                  </p>
                                </div>
                                <div className="bg-[#836EF9]/10 px-3 py-1 rounded-full">
                                  <p className="text-sm text-[#836EF9]">#{offer.id?.toString()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
                                <div>
                                  <p className="text-sm text-gray-600">Lending Amount</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {ethers.formatEther(offer.usdtAmount)} USDT
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Platform Fee</p>
                                  <p className="text-lg font-semibold text-[#836EF9]">
                                    {(Number(ethers.formatEther(offer.usdtAmount)) * 0.01).toFixed(5)} USDT
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Interest Rate</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {Number(offer.interestRate) / 100}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Required MON</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {ethers.formatEther(offer.requiredMon)} MON
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Duration</p>
                                  <p className="text-lg font-semibold text-gray-900">{offer.duration} minutes</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <p className="text-lg font-semibold text-[#836EF9]">
                                    {offer.isActive ? "Active" : "Inactive"}
                                  </p>
                                </div>
                              </div>

                              {/* Loan Terms Info Box */}
                              <div className="mb-4 p-4 bg-[#836EF9]/5 rounded-lg border border-[#836EF9]/20">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Info className="w-4 h-4 text-[#836EF9]" />
                                  <h4 className="text-sm font-semibold text-[#836EF9]">Loan Terms</h4>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-800">
                                    <span className="font-semibold">Borrower must pay:</span>{" "}
                                    {parseFloat(
                                      (
                                        Number(ethers.formatEther(offer.usdtAmount)) *
                                        (1 + Number(offer.interestRate) / 10000)
                                      ).toFixed(5)
                                    )}{" "}
                                    USDT after {offer.duration} minutes
                                  </p>
                                  <p className="text-sm text-gray-800">
                                    <span className="font-semibold">Interest amount:</span>{" "}
                                    {parseFloat(
                                      (
                                        Number(ethers.formatEther(offer.usdtAmount)) *
                                        (Number(offer.interestRate) / 10000)
                                      ).toFixed(5)
                                    )}{" "}
                                    USDT
                                  </p>
                                  <p className="text-sm text-[#836EF9] font-medium">
                                    If not repaid, you will receive {parseFloat(ethers.formatEther(offer.requiredMon))}{" "}
                                    MON collateral
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-4 pt-4 border-t border-[#836EF9]/20">
                                {offer.lender.toLowerCase() === address?.toLowerCase() ? (
                                  <Button
                                    onClick={() => handleCancelOffer(offer.id)}
                                    disabled={cancellingStates[offer.id]}
                                    className="bg-red-500 hover:bg-red-600 px-6 cursor-pointer"
                                  >
                                    {cancellingStates[offer.id] ? (
                                      <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                        Cancelling...
                                      </div>
                                    ) : (
                                      "Cancel Offer"
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleBorrowFromOffer(offer.id)}
                                    disabled={borrowingStates[offer.id]}
                                    className="bg-gradient-to-r from-[#836EF9] to-[#9B88FF] px-6 cursor-pointer"
                                  >
                                    {borrowingStates[offer.id] ? (
                                      <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Borrowing...
                                      </div>
                                    ) : (
                                      "Borrow Now"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-400">No active offers</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Borrow Tab Content */}
                  <TabsContent value="borrow" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-[#836EF9]">Available Offers to Borrow</h3>
                        <Button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          variant="outline"
                          className="border-[#836EF9] text-[#836EF9] cursor-pointer hover:bg-transparent hover:text-[#836EF9] hover:border-[#836EF9]"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      </div>

                      {/* Available Offers to Borrow */}
                      <div className="space-y-4">
                        {allOffers.map((offer) => (
                          <div key={offer.id} className="bg-white/5 p-6 rounded-lg border border-[#836EF9]/20">
                            <div className="flex items-center justify-between pb-4 border-b border-[#836EF9]/20">
                              <div className="flex items-center space-x-2">
                                <Wallet className="w-5 h-5 text-[#836EF9]" />
                                <p className="text-sm text-gray-800">
                                  Lender: {offer.lender?.slice(0, 6)}...{offer.lender?.slice(-4)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`px-3 py-1 rounded-full ${
                                    offer.isActive ? "bg-[#836EF9]/10 text-[#836EF9]" : "bg-gray-500/10 text-gray-400"
                                  }`}
                                >
                                  <p className="text-sm">{offer.isActive ? "Active" : "Borrowed"}</p>
                                </div>
                                <div className="bg-[#836EF9]/10 px-3 py-1 rounded-full">
                                  <p className="text-sm text-[#836EF9]">#{offer.id?.toString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
                              <div>
                                <p className="text-sm text-gray-600">Lending Amount</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {ethers.formatEther(offer.usdtAmount)} USDT
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Platform Fee</p>
                                <p className="text-lg font-semibold text-[#836EF9]">
                                  {(Number(ethers.formatEther(offer.usdtAmount)) * 0.01).toFixed(5)} USDT
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Interest Rate</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {Number(offer.interestRate) / 100}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Required MON</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {ethers.formatEther(offer.requiredMon)} MON
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="text-lg font-semibold text-gray-900">{offer.duration} minutes</p>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4 border-t border-[#836EF9]/20">
                              {offer.isActive && offer.lender.toLowerCase() !== address?.toLowerCase() && (
                                <Button
                                  onClick={() => handleBorrowFromOffer(offer.id)}
                                  disabled={borrowingStates[offer.id]}
                                  className="bg-gradient-to-r from-[#836EF9] to-[#9B88FF] px-6 cursor-pointer"
                                >
                                  {borrowingStates[offer.id] ? (
                                    <div className="flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Borrowing...
                                    </div>
                                  ) : (
                                    "Borrow Now"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* My Loans Tab Content */}
                  <TabsContent value="myloans" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-[#836EF9]">Your Active Loans</h3>
                        <Button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          variant="outline"
                          className="border-[#836EF9] text-[#836EF9] cursor-pointer hover:bg-transparent hover:text-[#836EF9] hover:border-[#836EF9]"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {userLoans.map((loan) => (
                          <div key={loan.id} className="bg-white/5 p-6 rounded-lg border border-[#836EF9]/20">
                            <div className="flex flex-col gap-2 lg:gap-0 lg:flex-row justify-between items-start lg:items-center pb-4 border-b border-[#836EF9]/20">
                              <div className="flex items-center space-x-2">
                                <Wallet className="w-5 h-5 text-[#836EF9]" />
                                <p className="text-sm text-gray-800">
                                  {loan.borrower.toLowerCase() === address?.toLowerCase() ? (
                                    <>
                                      Borrowed from: {loan.lender?.slice(0, 6)}...{loan.lender?.slice(-4)}
                                    </>
                                  ) : (
                                    <>
                                      Lent to: {loan.borrower?.slice(0, 6)}...{loan.borrower?.slice(-4)}
                                    </>
                                  )}
                                </p>
                              </div>
                              <div className="bg-[#836EF9]/10 px-3 py-1 rounded-full">
                                <p className="text-sm text-[#836EF9]">Loan #{loan.id?.toString()}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
                              <div>
                                <p className="text-sm text-gray-600">Borrowed Amount</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {ethers.formatEther(loan.usdtAmount)} USDT
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Collateral</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {ethers.formatEther(loan.monAmount)} MON
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Interest Rate</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {Number(loan.interestRate) / 100}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Start Time</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {new Date(Number(loan.startTime) * 1000).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="text-lg font-semibold text-gray-900">{loan.duration} minutes</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-[#836EF9]">
                                  {loan.isActive ? "Active" : loan.isRepaid ? "Repaid" : "Liquidated"}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center space-x-4 pt-4 border-t border-[#836EF9]/20">
                              <div className="text-sm">
                                {loan.isActive ? (
                                  Number(loan.startTime) + Number(loan.duration) * 60 >
                                  Math.floor(Date.now() / 1000) ? (
                                    <span className="text-[#836EF9] flex items-center gap-2">
                                      <Star className="w-4 h-4" />
                                      Time remaining:{" "}
                                      {Math.ceil(
                                        (Number(loan.startTime) +
                                          Number(loan.duration) * 60 -
                                          Math.floor(Date.now() / 1000)) /
                                          60
                                      )}{" "}
                                      minutes
                                    </span>
                                  ) : (
                                    <span className="text-red-400 flex items-center gap-2">
                                      <Edit className="w-4 h-4" />
                                      Loan period has expired
                                    </span>
                                  )
                                ) : loan.isRepaid ? (
                                  <span className="text-blue-400 flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Loan has been repaid
                                  </span>
                                ) : (
                                  <span className="text-red-400 flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Loan has been liquidated
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-end space-x-4">
                                {loan.isActive && (
                                  <>
                                    {loan.borrower.toLowerCase() === address?.toLowerCase() && (
                                      <Button
                                        onClick={() => handleRepayLoan(loan.id)}
                                        disabled={repayingLoans[loan.id]}
                                        className="bg-gradient-to-r from-[#836EF9] to-[#9B88FF] px-6 cursor-pointer"
                                      >
                                        {repayingLoans[loan.id] ? (
                                          <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Repaying...
                                          </div>
                                        ) : (
                                          "Repay Loan"
                                        )}
                                      </Button>
                                    )}
                                    {loan.lender.toLowerCase() === address?.toLowerCase() &&
                                      Number(loan.startTime) + Number(loan.duration) * 60 <
                                        Math.floor(Date.now() / 1000) && (
                                        <Button
                                          onClick={() => handleClaimCollateral(loan.id)}
                                          disabled={claimingStates[loan.id]}
                                          className="bg-red-500 hover:bg-red-600 px-6 cursor-pointer"
                                        >
                                          {claimingStates[loan.id] ? (
                                            <div className="flex items-center justify-center">
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                              Claiming...
                                            </div>
                                          ) : (
                                            "Claim Collateral"
                                          )}
                                        </Button>
                                      )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
