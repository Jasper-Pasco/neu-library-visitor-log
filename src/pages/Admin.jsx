import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Admin() {
  const [visitors, setVisitors] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [filter, setFilter] = useState("today");
  const [reasonFilter, setReasonFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      } else {
        fetchVisitors();
        fetchBlocked();
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchVisitors = async () => {
    const snapshot = await getDocs(collection(db, "visitors"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVisitors(data);
  };

  const fetchBlocked = async () => {
    const snapshot = await getDocs(collection(db, "blocked"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setBlocked(data);
  };

  const handleBlock = async (email) => {
    const alreadyBlocked = blocked.find((b) => b.email === email);
    if (alreadyBlocked) {
      alert(`${email} is already blocked.`);
      return;
    }
    await addDoc(collection(db, "blocked"), { email });
    alert(`${email} has been blocked.`);
    fetchBlocked();
  };

  const handleUnblock = async (email) => {
    const blockedUser = blocked.find((b) => b.email === email);
    if (blockedUser) {
      await deleteDoc(doc(db, "blocked", blockedUser.id));
      alert(`${email} has been unblocked.`);
      fetchBlocked();
    }
  };

  const isBlocked = (email) => blocked.some((b) => b.email === email);

  const filterByDate = (visitor) => {
    const now = new Date();
    const visitDate = visitor.timestamp.toDate();
    if (filter === "today") {
      return visitDate.toDateString() === now.toDateString();
    } else if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return visitDate >= weekAgo;
    } else if (filter === "month") {
      return (
        visitDate.getMonth() === now.getMonth() &&
        visitDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  const filteredVisitors = visitors
    .filter(filterByDate)
    .filter((v) => (reasonFilter ? v.reason === reasonFilter : true))
    .filter((v) => (collegeFilter ? v.college === collegeFilter : true))
    .filter((v) => (employeeFilter ? v.isEmployee === employeeFilter : true))
    .filter((v) =>
      search
        ? v.name?.toLowerCase().includes(search.toLowerCase()) ||
          v.reason?.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("NEU Library Visitor Log", 14, 16);
    autoTable(doc, {
      startY: 25,
      head: [["Name", "Email", "Reason", "College", "Program", "Employee", "Date"]],
      body: filteredVisitors.map((v) => [
        v.name,
        v.email,
        v.reason,
        v.college || "N/A",
        v.program || "N/A",
        v.isEmployee === "no" ? "Student" : v.isEmployee === "teacher" ? "Teacher" : "Staff",
        v.timestamp.toDate().toLocaleDateString(),
      ]),
    });
    doc.save("visitor-log.pdf");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #003087 0%, #001a4d 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px" }}>
      Loading...
    </div>
  );

    const selectStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,215,0,0.3)",
    background: "#1e2a4a",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    };

  const cardStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: "16px",
    padding: "24px",
    minWidth: "180px",
    flex: "1",
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", background: "linear-gradient(135deg, #003087 0%, #001a4d 100%)", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#FFD700", marginBottom: "4px" }}>Admin Dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>NEU Library Visitor Log System</p>
          <p style={{ color: "#FFD700", fontSize: "13px", marginTop: "4px" }}>{formatPHT(currentTime)} PHT</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
  <button onClick={() => navigate("/home")} style={{
    padding: "12px 24px",
    background: "linear-gradient(135deg, #FFD700, #FFA500)",
    color: "#001a4d",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  }}>
    Go to Kiosk
  </button>
  <button onClick={() => { auth.signOut(); navigate("/"); }} style={{
    padding: "12px 24px",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  }}>
    Logout
  </button>
</div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
        <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} style={selectStyle}>
          <option value="">All Reasons</option>
          <option value="Reading">Reading</option>
          <option value="Researching">Researching</option>
          <option value="Use of Computer">Use of Computer</option>
          <option value="Meeting">Meeting</option>
        </select>
        <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} style={selectStyle}>
          <option value="">All Colleges</option>
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
        <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} style={selectStyle}>
          <option value="">All Visitors</option>
          <option value="no">Students</option>
          <option value="teacher">Teachers</option>
          <option value="staff">Staff</option>
        </select>
        <input
          type="text"
          placeholder="Search name or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...selectStyle, minWidth: "200px" }}
        />
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "30px" }}>
        <div style={cardStyle}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Total Visits</p>
          <p style={{ fontSize: "42px", fontWeight: "700", color: "#FFD700" }}>{filteredVisitors.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Most Common Reason</p>
          <p style={{ fontSize: "22px", fontWeight: "600", color: "white" }}>
            {filteredVisitors.length === 0 ? "N/A" :
              Object.entries(
                filteredVisitors.reduce((acc, v) => {
                  acc[v.reason] = (acc[v.reason] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Most Active College</p>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>
            {filteredVisitors.length === 0 ? "N/A" :
              Object.entries(
                filteredVisitors.reduce((acc, v) => {
                  if (v.college) acc[v.college] = (acc[v.college] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Students vs Employees</p>
          <p style={{ fontSize: "14px", color: "white", lineHeight: "1.8" }}>
            👨‍🎓 Students: {filteredVisitors.filter(v => v.isEmployee === "no").length}<br />
            👨‍🏫 Teachers: {filteredVisitors.filter(v => v.isEmployee === "teacher").length}<br />
            👷 Staff: {filteredVisitors.filter(v => v.isEmployee === "staff").length}
          </p>
        </div>
      </div>

      {/* Export Button */}
      <button onClick={exportToPDF} style={{
        marginBottom: "24px",
        padding: "12px 24px",
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        color: "#001a4d",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
      }}>
        Export to PDF
      </button>

      {/* Table */}
      <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,215,0,0.2)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,215,0,0.15)" }}>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Email</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Reason</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>College</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Program</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Employee</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Date</th>
              <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#FFD700", textTransform: "uppercase", letterSpacing: "1px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((v, index) => (
              <tr key={v.id} style={{ background: index % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "14px 16px", fontSize: "14px" }}>{v.name}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{v.email}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px" }}>{v.reason}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{v.college || "N/A"}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px" }}>{v.program || "N/A"}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px" }}>{v.isEmployee === "no" ? "Student" : v.isEmployee === "teacher" ? "Teacher" : "Staff"}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                {v.timestamp.toDate().toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                })}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {isBlocked(v.email) ? (
                    <button onClick={() => handleUnblock(v.email)} style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                      Unblock
                    </button>
                  ) : (
                    <button onClick={() => handleBlock(v.email)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;