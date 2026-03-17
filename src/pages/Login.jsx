import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith("@neu.edu.ph")) {
        alert("Only NEU email accounts are allowed.");
        auth.signOut();
        return;
      }

      // Check if user is blocked
      const blockedSnapshot = await getDocs(collection(db, "blocked"));
      const blockedEmails = blockedSnapshot.docs.map((doc) => doc.data().email);

      if (blockedEmails.includes(email)) {
        alert("You are not allowed to use the library. Please contact the librarian.");
        auth.signOut();
        return;
      }

      // Check if the user is an admin
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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>NEU Library Visitor Log</h1>
      <p>Please sign in with your NEU Google account</p>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}

export default Login;