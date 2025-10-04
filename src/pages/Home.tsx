// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const memeEmojis = ["🐕", "🐸", "🚀", "💎", "🌙", "⚡", "🔥", "💰"];
const purpleTones = ["#836EF9", "#5E49C0", "#9B88FF", "#A599FF"];

import dogLogo from "../assets/memes/dog-logo.png";
import mewLogo from "../assets/memes/mew-logo.png";
import wifLogo from "../assets/memes/wif-logo.png";
import trumpLogo from "../assets/memes/trump-logo.png";
import bonkLogo from "../assets/memes/bonk-logo.png";
import penguLogo from "../assets/memes/pengu-logo.jpeg";
import pepeLogo from "../assets/memes/pepe-logo.png";
import shibLogo from "../assets/memes/shib-logo.jpeg";
import dogecoinLogo from "../assets/memes/dogecoin.webp";

const memeTokens = [
  { name: "DOGE", logo: dogecoinLogo },
  { name: "PEPE", logo: pepeLogo },
  { name: "SHIB", logo: shibLogo },
  { name: "WIF", logo: wifLogo },
  { name: "BONK", logo: bonkLogo },
  { name: "MEW", logo: mewLogo },
  { name: "TRUMP", logo: trumpLogo },
  { name: "PENGU", logo: penguLogo },
  { name: "DOG", logo: dogLogo },
];

function getRandomPurple() {
  return purpleTones[Math.floor(Math.random() * purpleTones.length)];
}

function getRandomEmoji() {
  return memeEmojis[Math.floor(Math.random() * memeEmojis.length)];
}

function createFloatingEmoji(delay = 0) {
  const size = Math.floor(Math.random() * 30) + 40;
  const left = Math.floor(Math.random() * 100) + "%";
  return {
    id: uuidv4(),
    emoji: getRandomEmoji(),
    size,
    left,
    delay,
  };
}

const Home = () => {
  const [floatingEmojis, setFloatingEmojis] = useState<
    Array<{ id: string; emoji: string; size: number; left: string; delay?: number }>
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Create initial emojis with staggered start times
    const initialEmojis = Array.from({ length: 3 }, (_, i) => ({
      ...createFloatingEmoji(),
      delay: i * 2,
    }));

    const interval = setInterval(() => {
      setFloatingEmojis((prev) => {
        // Limit to max 8 emojis at once
        if (prev.length >= 8) {
          return prev;
        }
        return [...prev, createFloatingEmoji()];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function handleEmojiComplete(id: string) {
    setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
  }

  function handleGetStarted() {
    navigate("/dashboard");
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFFFF 0%, #F6F6F5 50%, #EDEDFD 100%)",
        overflow: "hidden",
        fontFamily: "'Tektur', sans-serif",
      }}
    >
      {/* Animated Background Blobs */}
      <motion.div
        initial={{ opacity: 0.15, scale: 1, x: 0, y: 0 }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(131,110,249,0.4), rgba(94,73,192,0.2))",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0.15, scale: 1 }}
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 2 }}
        style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(131,110,249,0.35), rgba(94,73,192,0.15))",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Meme Emojis */}
      <AnimatePresence>
        {floatingEmojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ y: "110vh", opacity: 0, rotate: 0 }}
            animate={{
              y: "-20vh",
              opacity: [0, 0.8, 1, 0.8, 0],
              rotate: [0, 360],
              x: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 12,
              ease: "linear",
              delay: emoji.delay || 0,
            }}
            onAnimationComplete={() => handleEmojiComplete(emoji.id)}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: emoji.left,
              fontSize: `${emoji.size}px`,
              pointerEvents: "none",
              userSelect: "none",
              filter: "drop-shadow(0 0 10px rgba(131, 110, 249, 0.5))",
            }}
          >
            {emoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* SECTION 1: HERO */}
      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "30vh",
          paddingTop: "1rem",
          paddingBottom: "3rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 50%, #836EF9 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}
        >
          MONADLEND
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontSize: "clamp(1.3rem, 5vw, 2.5rem)",
            fontWeight: 700,
            color: "#5E49C0",
            marginBottom: "1rem",
            maxWidth: "900px",
          }}
        >
          Binance Listing Mi Bekliyorsun? 🚀
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{
            fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
            color: "#5E49C0",
            marginBottom: "3rem",
            maxWidth: "800px",
            lineHeight: "1.6",
            opacity: 0.85,
          }}
        >
          Haftalarca tokenını cüzdanında tutma! Yüksek faizle borç ver, ya da hızlıca borç al, sat ve öde. Senin
          meme'in, senin kuralların! 💎
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(131, 110, 249, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "1.2rem 3.5rem",
              borderRadius: "50px",
              border: "none",
              background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 100%)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            🚀 Launch App
          </motion.button>
        </motion.div>
      </section>

      {/* MEME TOKEN SLIDER */}
      <section
        style={{
          position: "relative",
          padding: "3rem 0",
          overflow: "hidden",
          background: "rgba(131, 110, 249, 0.05)",
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          style={{
            display: "flex",
            gap: "4rem",
            width: "max-content",
          }}
        >
          {/* Double the tokens for seamless loop */}
          {[...memeTokens, ...memeTokens].map((token, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem 2rem",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "50px",
                border: "2px solid rgba(131, 110, 249, 0.2)",
                boxShadow: "0 4px 15px rgba(131, 110, 249, 0.1)",
                minWidth: "fit-content",
                whiteSpace: "nowrap",
              }}
            >
              <img
                src={token.logo}
                alt={token.name}
                style={{ width: "4rem", height: "4rem", borderRadius: "50%", objectFit: "cover" }}
              />
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#836EF9",
                }}
              >
                ${token.name}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section
        style={{
          position: "relative",
          padding: "6rem 2rem",
          background: "linear-gradient(180deg, rgba(131,110,249,0.05) 0%, rgba(255,255,255,0) 100%)",
          zIndex: 10,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900,
            textAlign: "center",
            background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "4rem",
          }}
        >
          Nasıl Çalışır?
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <MemeStepCard
            number="1"
            emoji="💰"
            title="Meme Token Teminat Göster"
            description="Elindeki DOGE, PEPE, SHIB gibi meme tokenları teminat olarak kilitle."
            delay={0.2}
          />
          <MemeStepCard
            number="2"
            emoji="⚡"
            title="USDT Borç Al"
            description="Teminatın karşılığında anında USDT borçlan. Hızlı, güvenli, merkeziyetsiz!"
            delay={0.4}
          />
          <MemeStepCard
            number="3"
            emoji="🔥"
            title="Kullan, Öde, Geri Al"
            description="USDT'yi kullan, faizi ile geri öde, meme tokenlarını geri al. Basit!"
            delay={0.6}
          />
        </div>
      </section>

      {/* SECTION 3: DETAILED SYSTEM EXPLANATION */}
      <section
        style={{
          position: "relative",
          padding: "6rem 2rem",
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(131,110,249,0.05) 100%)",
          zIndex: 10,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900,
            textAlign: "center",
            background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "4rem",
          }}
        >
          Sistem Nasıl İşliyor?
        </motion.h2>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "4rem",
          }}
        >
          {/* For Borrowers */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "3rem",
              borderRadius: "30px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 40px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem", textAlign: "center" }}>🏦</div>
            <h3
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Borç Alanlar İçin 💎
            </h3>
            <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)", color: "#5E49C0", lineHeight: "1.8" }}>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>🎯 Sorun:</strong> Elinde DOGE, PEPE, SHIB gibi meme tokenlar var
                ama nakite (USDT) ihtiyacın var. Satmak istemiyorsun çünkü fiyatı yükselecek!
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>✨ Çözüm:</strong> Tokenlarını satma, teminat göster! Meme
                tokenlarını akıllı kontrata kilitle, karşılığında USDT borçlan.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>💰 Kullan:</strong> USDT'yi istediğin gibi kullan - yeni token al,
                trade yap, harcama yap.
              </p>
              <p>
                <strong style={{ color: "#836EF9" }}>🔄 Geri Öde:</strong> USDT + faizi geri öde, meme tokenlarını geri
                al.
              </p>
            </div>
          </motion.div>

          {/* For Lenders */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "3rem",
              borderRadius: "30px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 40px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem", textAlign: "center" }}>📈</div>
            <h3
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Borç Verenler İçin 🚀
            </h3>
            <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)", color: "#5E49C0", lineHeight: "1.8" }}>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>💵 USDT'n var mı?</strong> Bankada %5 faiz yerine, buradan çok daha
                yüksek faiz kazanabilirsin!
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>🔒 Güvenli:</strong> Borç alanlar meme tokenlarını teminat
                gösteriyor. Ödeme yapmazlarsa, teminat senindir!
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>📊 Yüksek Getiri:</strong> Piyasa faiz oranlarından çok daha fazla
                kazanç potansiyeli.
              </p>
            </div>
          </motion.div>

          {/* Why It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: "linear-gradient(135deg, rgba(131,110,249,0.1) 0%, rgba(94,73,192,0.1) 100%)",
              backdropFilter: "blur(20px)",
              padding: "3rem",
              borderRadius: "30px",
              border: "3px solid rgba(131, 110, 249, 0.4)",
              boxShadow: "0 10px 40px rgba(131, 110, 249, 0.3)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem", textAlign: "center" }}>⚙️</div>
            <h3
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Neden mantıklı? 🤔
            </h3>
            <div
              style={{
                fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                color: "#5E49C0",
                lineHeight: "1.8",
                textAlign: "center",
              }}
            >
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>🎲 Risk & Ödül Dengesi:</strong> Borç verenler yüksek faiz
                karşılığında risk alır. Borç alanlar meme tokenlarını satmadan nakite erişir.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <strong style={{ color: "#836EF9" }}>💎 Likidite Kilit Değil:</strong> Teminatlar otomatik liquidate
                edilebilir. Bu yüzden borç verenler her zaman korunur!
              </p>
              <p>
                <strong style={{ color: "#836EF9" }}>🌍 Global & Permissionless:</strong> KYC yok, banka yok!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: COMPARISON WITH TRADITIONAL DEFI */}
      <section
        style={{
          position: "relative",
          padding: "6rem 2rem",
          background: "linear-gradient(180deg, rgba(131,110,249,0.05) 0%, rgba(255,255,255,0) 100%)",
          zIndex: 10,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900,
            textAlign: "center",
            background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "4rem",
          }}
        >
          Aave & Compound'dan Farkımız
        </motion.h2>

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>🚫</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Onay Yok!
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Aave ve Compound'da tokenını listelemek için DAO onayı gerekir. Bizde{" "}
              <strong>herkes istediği meme token'ı listeleyebilir!</strong> Tamamen permissionless!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>🎯</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Meme Token Odaklı
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Geleneksel DeFi protokolleri blue-chip tokenlar için tasarlandı. Biz{" "}
              <strong>özellikle meme tokenlar için optimize edilmiş</strong> ilk platform!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>⚡</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Süper Esnek
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Aave ve Compound karmaşık governance ve katı kurallarla çalışır.{" "}
              <strong>Monadlend ise basit, hızlı ve esnek!</strong> Herkes kendi borç piyasasını oluşturabilir.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>💸</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Düşük Maliyet
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Ethereum'daki yüksek gas ücretlerinden bıktın mı?{" "}
              <strong>Monad blockchain'de ultra-düşük maliyetle ve yüksek hızda</strong> işlem yap!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>🎪</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Yüksek Risk = Yüksek Ödül
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Aave/Compound konservatif ve düşük APY sunar. Biz{" "}
              <strong>meme token volatilitesini fırsata çeviriyoruz!</strong> Yüksek risk, yüksek getiri!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              padding: "2.5rem",
              borderRadius: "25px",
              border: "3px solid rgba(131, 110, 249, 0.3)",
              boxShadow: "0 10px 30px rgba(131, 110, 249, 0.2)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", textAlign: "center" }}>🌈</div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#836EF9",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Topluluk Odaklı
            </h3>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#5E49C0",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Büyük protokoller kurumsal ve karmaşık. <strong>Biz meme coin community için yapıldık!</strong> Basit,
              eğlenceli, erişilebilir.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const MemeStepCard = ({
  number,
  emoji,
  title,
  description,
  delay,
}: {
  number: string;
  emoji: string;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.7 }}
    whileHover={{
      y: -15,
      boxShadow: "0 20px 60px rgba(131, 110, 249, 0.4)",
      scale: 1.02,
    }}
    style={{
      position: "relative",
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px)",
      padding: "3rem 2rem",
      borderRadius: "30px",
      border: "3px solid rgba(131, 110, 249, 0.2)",
      boxShadow: "0 10px 40px rgba(131, 110, 249, 0.15)",
      textAlign: "center",
      overflow: "hidden",
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        top: "-50%",
        right: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(131,110,249,0.05), transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <div
      style={{
        position: "relative",
        fontSize: "1.5rem",
        fontWeight: 900,
        color: "#FFFFFF",
        background: "linear-gradient(135deg, #836EF9 0%, #5E49C0 100%)",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
        boxShadow: "0 5px 20px rgba(131, 110, 249, 0.4)",
      }}
    >
      {number}
    </div>

    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{emoji}</div>

    <h3
      style={{
        fontSize: "1.8rem",
        fontWeight: 800,
        color: "#836EF9",
        marginBottom: "1rem",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: "1.1rem",
        color: "#5E49C0",
        lineHeight: "1.7",
        opacity: 0.9,
      }}
    >
      {description}
    </p>
  </motion.div>
);

export default Home;
