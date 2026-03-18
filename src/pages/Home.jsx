import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Home() {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [college, setCollege] = useState("");
  const [isEmployee, setIsEmployee] = useState("no");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!reason || !college) {
      alert("Please fill in all fields.");
      return;
    }

    await addDoc(collection(db, "visitors"), {
      name: user.displayName,
      email: user.email,
      reason: reason,
      college: college,
      isEmployee: isEmployee,
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
      <p>Please fill in the details below:</p>

      <div style={{ marginBottom: "10px" }}>
        <label>Reason for visit: </label>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">-- Select a reason --</option>
          <option value="Reading">Reading</option>
          <option value="Researching">Researching</option>
          <option value="Use of Computer">Use of Computer</option>
          <option value="Meeting">Meeting</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>College: </label>
       <select value={college} onChange={(e) => setCollege(e.target.value)}>
  <option value="">-- Select a college --</option>
  <option value="College of Accountancy">College of Accountancy</option>
  <option value="College of Agriculture">College of Agriculture</option>
  <option value="College of Arts and Sciences">College of Arts and Sciences</option>
  <option value="College of Business Administration">College of Business Administration</option>
  <option value="College of Communication">College of Communication</option>
  <option value="College of Criminology">College of Criminology</option>
  <option value="College of Education">College of Education</option>
  <option value="College of Engineering and Architecture">College of Engineering and Architecture</option>
  <option value="College of Informatics and Computing Studies">College of Informatics and Computing Studies</option>
  <option value="College of Law">College of Law</option>
  <option value="College of Medical Technology">College of Medical Technology</option>
  <option value="College of Medicine">College of Medicine</option>
  <option value="College of Midwifery">College of Midwifery</option>
  <option value="College of Music">College of Music</option>
  <option value="College of Nursing">College of Nursing</option>
  <option value="College of Physical Therapy">College of Physical Therapy</option>
  <option value="College of Respiratory Therapy">College of Respiratory Therapy</option>
  <option value="School of International Relations">School of International Relations</option>
</select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Are you an employee? </label>
        <select value={isEmployee} onChange={(e) => setIsEmployee(e.target.value)}>
          <option value="no">No (Student)</option>
          <option value="teacher">Yes - Teacher</option>
          <option value="staff">Yes - Staff</option>
        </select>
      </div>

      <button onClick={handleSubmit}>Log my visit</button>
    </div>
  );
}

export default Home;