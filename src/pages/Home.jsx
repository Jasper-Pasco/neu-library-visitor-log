import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const collegePrograms = {
  "College of Accountancy": [
    "BS Accountancy",
    "BS Accounting Information System",
  ],
  "College of Agriculture": [
    "BS Agriculture",
  ],
  "College of Arts and Sciences": [
    "BA Economics",
    "BA Political Science",
    "BS Biology",
    "BS Psychology",
    "BPA Public Administration",
  ],
  "College of Business Administration": [
    "BS Business Administration Major in Financial Management",
    "BS Business Administration Major in Human Resource Development Management",
    "BS Business Administration Major in Legal Management",
    "BS Business Administration Major in Marketing Management",
    "BS Entrepreneurship",
    "BS Real Estate Management",
  ],
  "College of Communication": [
    "BA Broadcasting",
    "BA Communication",
    "BA Journalism",
  ],
  "College of Informatics and Computing Studies": [
    "BLIS Library and Information Science",
    "BS Computer Science",
    "BS Entertainment and Multimedia Computing - Digital Animation Technology",
    "BS Entertainment and Multimedia Computing - Game Development",
    "BS Information Technology",
    "BS Information System",
  ],
  "College of Criminology": [
    "BS Criminology",
  ],
  "College of Education": [
    "BEEd Elementary Education",
    "BEEd Elementary Education - Preschool Education",
    "BEEd Elementary Education - Special Education",
    "BSEd Major in Music, Arts, and Physical Education",
    "BSEd Major in English",
    "BSEd Major in Filipino",
    "BSEd Major in Mathematics",
    "BSEd Major in Science",
    "BSEd Major in Social Studies",
    "BSEd Major in Technology and Livelihood Education",
  ],
  "College of Engineering and Architecture": [
    "BS Architecture",
    "BS Astronomy",
    "BS Civil Engineering",
    "BS Electrical Engineering",
    "BS Electronics Engineering",
    "BS Industrial Engineering",
    "BS Mechanical Engineering",
  ],
  "College of Medical Technology": [
    "BS Medical Technology",
  ],
  "College of Midwifery": [
    "Diploma in Midwifery",
  ],
  "College of Music": [
    "BM Choral Conducting",
    "BM Music Education",
    "BM Piano",
    "BM Voice",
  ],
  "College of Nursing": [
    "BS Nursing",
  ],
  "College of Physical Therapy": [
    "BS Physical Therapy",
  ],
  "College of Respiratory Therapy": [
    "BS Respiratory Therapy",
  ],
  "School of International Relations": [
    "BA Foreign Service",
  ],
};

function Home() {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
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

  const handleCollegeChange = (e) => {
    setCollege(e.target.value);
    setProgram("");
  };

  const handleSubmit = async () => {
    if (!reason || !college || !program) {
      alert("Please fill in all fields.");
      return;
    }

    await addDoc(collection(db, "visitors"), {
      name: user.displayName,
      email: user.email,
      reason: reason,
      college: college,
      program: program,
      isEmployee: isEmployee,
      timestamp: Timestamp.now(),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        padding: "40px",
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>🎉</h1>
        <h2 style={{ fontSize: "36px", marginBottom: "10px" }}>Welcome to NEU Library!</h2>
        <h3 style={{ fontSize: "24px", marginBottom: "5px" }}>{user.displayName}</h3>
        <p style={{ fontSize: "18px", color: "#aaa" }}>{program}</p>
        <p style={{ fontSize: "16px", marginTop: "20px", color: "#aaa" }}>Your visit has been logged. Enjoy your stay!</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #003087 0%, #001a4d 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      padding: "40px",
    }}>
      <h1 style={{ fontSize: "36px", marginBottom: "5px" }}>NEU Library</h1>
      <p style={{ fontSize: "18px", color: "#aaa", marginBottom: "30px" }}>
        Welcome, {user?.displayName}! Please fill in the details below.
      </p>

      <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}>Reason for Visit</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "none", background: "#1e1e2e", color: "white" }}>
            <option value="">-- Select a reason --</option>
            <option value="Reading">Reading</option>
            <option value="Researching">Researching</option>
            <option value="Use of Computer">Use of Computer</option>
            <option value="Meeting">Meeting</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}>College</label>
          <select value={college} onChange={handleCollegeChange}
            style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "none", background: "#1e1e2e", color: "white" }}>
            <option value="">-- Select a college --</option>
            {Object.keys(collegePrograms).map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {college && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}>Program</label>
            <select value={program} onChange={(e) => setProgram(e.target.value)}
              style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "none", background: "#1e1e2e", color: "white" }}>
              <option value="">-- Select a program --</option>
              {collegePrograms[college].map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}>Are you an employee?</label>
          <select value={isEmployee} onChange={(e) => setIsEmployee(e.target.value)}
            style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "none", background: "#1e1e2e", color: "white" }}>
            <option value="no">No (Student)</option>
            <option value="teacher">Yes - Teacher</option>
            <option value="staff">Yes - Staff</option>
          </select>
        </div>

        <button onClick={handleSubmit}
        style={{ width: "100%", padding: "15px", fontSize: "18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#001a4d", cursor: "pointer", marginTop: "10px" }}>
          Log My Visit
        </button>
      </div>
    </div>
  );
}

export default Home;