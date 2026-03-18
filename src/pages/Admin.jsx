import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

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
      head: [["Name", "Email", "Reason", "Date"]],
      body: filteredVisitors.map((v) => [
        v.name,
        v.email,
        v.reason,
        v.timestamp.toDate().toLocaleDateString(),
      ]),
    });
    doc.save("visitor-log.pdf");
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
  <h1>Admin Dashboard</h1>
  <button
    onClick={() => navigate("/home")}
    style={{ padding: "10px 20px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
    Go to Kiosk
  </button>
</div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Total visitors: {filteredVisitors.length}</strong>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>

        <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
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

<select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
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
        />
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
  <div style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", minWidth: "150px" }}>
    <h3>Total Visits</h3>
    <p style={{ fontSize: "32px" }}>{filteredVisitors.length}</p>
  </div>

  <div style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", minWidth: "150px" }}>
    <h3>Most Common Reason</h3>
    <p style={{ fontSize: "18px" }}>
      {filteredVisitors.length === 0 ? "N/A" : 
        Object.entries(
          filteredVisitors.reduce((acc, v) => {
            acc[v.reason] = (acc[v.reason] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
    </p>
  </div>

  <div style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", minWidth: "150px" }}>
    <h3>Most Active College</h3>
    <p style={{ fontSize: "14px" }}>
      {filteredVisitors.length === 0 ? "N/A" :
        Object.entries(
          filteredVisitors.reduce((acc, v) => {
            if (v.college) acc[v.college] = (acc[v.college] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
    </p>
  </div>

  <div style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", minWidth: "150px" }}>
    <h3>Students vs Employees</h3>
    <p style={{ fontSize: "14px" }}>
      Students: {filteredVisitors.filter(v => v.isEmployee === "no").length}<br/>
      Teachers: {filteredVisitors.filter(v => v.isEmployee === "teacher").length}<br/>
      Staff: {filteredVisitors.filter(v => v.isEmployee === "staff").length}
    </p>
  </div>
</div>

      <button
  onClick={exportToPDF}
  style={{ marginBottom: "20px", padding: "10px 20px", background: "#4a90e2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
>
  Export to PDF
</button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
  <tr style={{ borderBottom: "1px solid #444" }}>
    <th style={{ textAlign: "left", padding: "10px" }}>Name</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Email</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Reason</th>
    <th style={{ textAlign: "left", padding: "10px" }}>College</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Program</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Employee</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Date</th>
    <th style={{ textAlign: "left", padding: "10px" }}>Action</th>
  </tr>
 </thead>
        <tbody>
          {filteredVisitors.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #333" }}>
  <td style={{ padding: "10px" }}>{v.name}</td>
  <td style={{ padding: "10px" }}>{v.email}</td>
  <td style={{ padding: "10px" }}>{v.reason}</td>
  <td style={{ padding: "10px" }}>{v.college || "N/A"}</td>
  <td style={{ padding: "10px" }}>{v.program || "N/A"}</td>
  <td style={{ padding: "10px" }}>{v.isEmployee === "no" ? "Student" : v.isEmployee === "teacher" ? "Teacher" : "Staff"}</td>
  <td style={{ padding: "10px" }}>
    {v.timestamp.toDate().toLocaleDateString()}
  </td>
              <td style={{ padding: "10px" }}>
                {isBlocked(v.email) ? (
                  <button
                    onClick={() => handleUnblock(v.email)}
                    style={{ background: "green", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlock(v.email)}
                    style={{ background: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
                  >
                    Block
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;