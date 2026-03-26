import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPHT = (date) => {
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith("@neu.edu.ph")) {
        alert("Only NEU email accounts are allowed.");
        auth.signOut();
        return;
      }

      const blockedSnapshot = await getDocs(collection(db, "blocked"));
      const blockedEmails = blockedSnapshot.docs.map((doc) => doc.data().email);

      if (blockedEmails.includes(email)) {
        alert("You are not allowed to use the library. Please contact the librarian.");
        auth.signOut();
        return;
      }

      const adminSnapshot = await getDocs(collection(db, "admins"));
      const adminEmails = adminSnapshot.docs.map((doc) => doc.data().email);

      if (adminEmails.includes(email)) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #003087 0%, #001a4d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: "20px",
        padding: "60px 50px",
        textAlign: "center",
        maxWidth: "420px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <img src="/neu-logo.png" alt="NEU Logo" style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          margin: "0 auto 20px",
          display: "block",
        }} />

        <h1 style={{
          color: "#FFD700",
          fontSize: "28px",
          marginBottom: "8px",
          fontWeight: "700",
          letterSpacing: "1px",
        }}>NEU Library</h1>

        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "14px",
          marginBottom: "10px",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>Visitor Log</p>

        <p style={{
          color: "#FFD700",
          fontSize: "13px",
          marginBottom: "30px",
        }}>{formatPHT(currentTime)} PHT</p>

        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "15px",
          marginBottom: "30px",
        }}>Sign in with your NEU Google account to continue</p>

        <button onClick={handleLogin} style={{
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #FFD700, #FFA500)",
          color: "#001a4d",
          border: "none",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
          letterSpacing: "0.5px",
          boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
        }}>
          Sign in with Google
        </button>

        <p style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "12px",
          marginTop: "30px",
        }}>New Era University — Library Services</p>
      </div>
    </div>
  );
}

export default Login;