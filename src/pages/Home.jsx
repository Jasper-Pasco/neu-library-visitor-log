import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function Home() {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
    }
  }, []);

  const handleSubmit = async () => {
    if (!reason) {
      alert("Please enter a reason for your visit.");
      return;
    }

    await addDoc(collection(db, "visitors"), {
      name: user.displayName,
      email: user.email,
      reason: reason,
      timestamp: Timestamp.now(),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Welcome to NEU Library, {user.displayName}!</h2>
        <p>Your visit has been logged. Enjoy your stay!</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Welcome, {user?.displayName}!</h2>
      <p>Please enter your reason for visiting the library:</p>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="">-- Select a reason --</option>
        <option value="Reading">Reading</option>
        <option value="Researching">Researching</option>
        <option value="Use of Computer">Use of Computer</option>
        <option value="Meeting">Meeting</option>
      </select>
      <br /><br />
      <button onClick={handleSubmit}>Log my visit</button>
    </div>
  );
}

export default Home;