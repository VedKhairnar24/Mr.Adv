import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

/* ─── Icons ─── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 10v6M14 10v6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

/* ─── Shared button styles (matches reference exactly) ─── */
const BTN_PRIMARY = {
  display:        "inline-flex",
  alignItems:     "center",
  gap:            "6px",
  minHeight:      "34px",
  height:         "34px",
  padding:        "0 14px",
  background:     "var(--gold)",
  color:          "var(--bg, #0a1210)",
  fontFamily:     "Rajdhani, sans-serif",
  fontSize:       "10px",
  fontWeight:     700,
  letterSpacing:  "2px",
  textTransform:  "uppercase",
  border:         "none",
  cursor:         "pointer",
  textDecoration: "none",
  whiteSpace:     "nowrap",
  clipPath:       "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
  transition:     "background 0.2s, transform 0.15s",
  flexShrink:     0,
};

const BTN_PRIMARY_MD = {
  ...BTN_PRIMARY,
  minHeight:   "44px",
  height:      "44px",
  padding:     "0 28px",
  fontSize:    "11px",
  letterSpacing: "2.5px",
  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
};

const BTN_GHOST = {
  display:        "inline-flex",
  alignItems:     "center",
  gap:            "6px",
  minHeight:      "34px",
  height:         "34px",
  padding:        "0 14px",
  background:     "transparent",
  color:          "var(--muted)",
  fontFamily:     "Rajdhani, sans-serif",
  fontSize:       "10px",
  fontWeight:     700,
  letterSpacing:  "1.5px",
  textTransform:  "uppercase",
  border:         "1px solid var(--border)",
  borderRadius:   "2px",
  cursor:         "pointer",
  textDecoration: "none",
  whiteSpace:     "nowrap",
  transition:     "all 0.2s",
  flexShrink:     0,
};

const BTN_GHOST_MD = {
  ...BTN_GHOST,
  minHeight: "44px",
  height:    "44px",
  padding:   "0 24px",
  fontSize:  "11px",
  letterSpacing: "2px",
};

const BTN_DANGER = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  gap:            "6px",
  width:          "34px",
  minWidth:       "34px",
  height:         "34px",
  minHeight:      "34px",
  padding:        0,
  background:     "transparent",
  color:          "var(--danger, #c0392b)",
  border:         "1px solid rgba(192,57,43,0.25)",
  borderRadius:   "2px",
  cursor:         "pointer",
  transition:     "all 0.2s",
  flexShrink:     0,
};

const ICON_SM = { width: "13px", height: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const ICON_MD = { width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

/* ─── Main Component ─── */
function Cases() {
  const [cases,        setCases]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [showForm,     setShowForm]     = useState(false);
  const [formData,     setFormData]     = useState({
    client_id: "", case_title: "", case_number: "",
    court_name: "", case_type: "", filing_date: "",
  });

  /* hover state helpers */
  const hoverPrimary   = (e) => { e.currentTarget.style.background = "var(--gold2, #e6cc78)"; e.currentTarget.style.transform = "translateY(-1px)"; };
  const unhoverPrimary = (e) => { e.currentTarget.style.background = "var(--gold, #c8a84b)";  e.currentTarget.style.transform = "translateY(0)"; };

  const hoverGhost   = (e) => { e.currentTarget.style.borderColor = "rgba(200,168,75,0.5)"; e.currentTarget.style.color = "var(--white, #f0ebe0)"; };
  const unhoverGhost = (e) => { e.currentTarget.style.borderColor = "var(--border)";         e.currentTarget.style.color = "var(--muted)"; };

  const hoverDanger   = (e) => { e.currentTarget.style.background = "rgba(192,57,43,0.12)"; e.currentTarget.style.borderColor = "var(--danger, #c0392b)"; };
  const unhoverDanger = (e) => { e.currentTarget.style.background = "transparent";           e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)"; };

  const hoverRow = (e) => {
    e.currentTarget.style.background     = "rgba(255,255,255,0.02)";
    e.currentTarget.style.borderLeftColor = "var(--gold, #c8a84b)";
  };
  const unhoverRow = (e) => {
    e.currentTarget.style.background     = "transparent";
    e.currentTarget.style.borderLeftColor = "transparent";
  };

  /* data helpers */
  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data);
      setError(null);
    } catch {
      setError("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const createCase = async (e) => {
    e.preventDefault();
    try {
      await API.post("/cases/create", formData);
      alert("Case created successfully!");
      setFormData({ client_id: "", case_title: "", case_number: "", court_name: "", case_type: "", filing_date: "" });
      setShowForm(false);
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create case");
    }
  };

  const deleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      await API.delete(`/cases/${id}`);
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete case");
    }
  };

  const getStatusBadgeClass = (status = "") => {
    const v = status.toLowerCase();
    if (v === "active" || v === "completed")                     return "badge-active";
    if (v === "pending" || v === "adjourned" || v === "on hold") return "badge-pending";
    if (v === "scheduled")                                        return "badge-scheduled";
    if (v === "closed"   || v === "cancelled")                   return "badge-closed";
    if (v === "disposed")                                         return "badge-disposed";
    return "badge-disposed";
  };

  useEffect(() => { fetchCases(); }, []);

  const filteredCases = cases.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (item.case_title  || "").toLowerCase().includes(q) ||
      (item.client_name || "").toLowerCase().includes(q) ||
      (item.court_name  || "").toLowerCase().includes(q) ||
      (item.case_number || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchType   = typeFilter   === "All Types"  || (item.case_type || "Other").toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  /* shared input style */
  const inputStyle = {
    width: "100%", height: "48px",
    background: "var(--bg, #0a1210)",
    border: "1px solid var(--border)",
    borderRadius: "3px",
    color: "var(--white, #f0ebe0)",
    fontFamily: "Rajdhani, sans-serif",
    fontSize: "14px", fontWeight: 400,
    padding: "0 14px",
    outline: "none",
  };
  const selectStyle = { ...inputStyle, padding: "0 14px", cursor: "pointer" };
  const labelStyle  = {
    display: "block",
    fontFamily: "Rajdhani, sans-serif",
    fontSize: "10px", fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "var(--gold, #c8a84b)",
    marginBottom: "8px",
  };

  /* ─── RENDER ─── */
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ════ SECTION A: PAGE HEADER ════ */}
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Cases</h1>
          <p className="app-header-subtitle">Manage your legal cases</p>
        </div>

        {/* ── NEW CASE button — matches reference exactly ── */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={BTN_PRIMARY_MD}
          onMouseEnter={hoverPrimary}
          onMouseLeave={unhoverPrimary}
        >
          {showForm
            ? <><span style={ICON_SM}><XIcon /></span>Cancel</>
            : <><span style={ICON_SM}><PlusIcon /></span>New Case</>
          }
        </button>
      </header>

      <div className="app-body">

        {/* ════ CREATE CASE FORM ════ */}
        {showForm && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "28px 32px",
            marginBottom: "20px",
            position: "relative",
          }}>
            {/* corner brackets */}
            <span style={{ position:"absolute", top:"12px", left:"12px", width:"18px", height:"18px", borderTop:"1px solid var(--gold)", borderLeft:"1px solid var(--gold)", opacity:.35 }} />
            <span style={{ position:"absolute", bottom:"12px", right:"12px", width:"18px", height:"18px", borderBottom:"1px solid var(--gold)", borderRight:"1px solid var(--gold)", opacity:.35 }} />

            {/* card label */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"22px" }}>
              <span style={{ width:"20px", height:"1px", background:"var(--gold)" }} />
              <span style={{ fontFamily:"Rajdhani,sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"var(--gold)" }}>
                Create New Case
              </span>
            </div>

            <form onSubmit={createCase}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>

                {/* Client ID */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Client ID *</label>
                  <input type="number" name="client_id" value={formData.client_id} onChange={handleInputChange}
                    placeholder="Enter client ID" required style={inputStyle}
                    onFocus={(e)  => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)   => { e.target.style.borderColor = "var(--border)"; }} />
                  <p style={{ fontSize:"10px", color:"var(--muted)", marginTop:"5px", fontFamily:"Rajdhani,sans-serif" }}>
                    Create clients first in the Clients page
                  </p>
                </div>

                {/* Case Title */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Case Title *</label>
                  <input type="text" name="case_title" value={formData.case_title} onChange={handleInputChange}
                    placeholder="e.g., Smith v. Johnson" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }} />
                </div>

                {/* Case Number */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Case Number</label>
                  <input type="text" name="case_number" value={formData.case_number} onChange={handleInputChange}
                    placeholder="e.g., CV-2024-001" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }} />
                </div>

                {/* Court Name */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Court Name *</label>
                  <input type="text" name="court_name" value={formData.court_name} onChange={handleInputChange}
                    placeholder="e.g., High Court of Delhi" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }} />
                </div>

                {/* Case Type */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Case Type</label>
                  <select name="case_type" value={formData.case_type} onChange={handleInputChange} style={selectStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}>
                    <option value="">Select Type</option>
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Family">Family</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Property">Property</option>
                    <option value="Labor">Labor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Filing Date */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={labelStyle}>Filing Date</label>
                  <input type="date" name="filing_date" value={formData.filing_date} onChange={handleInputChange}
                    style={{ ...inputStyle, colorScheme:"dark" }}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }} />
                </div>
              </div>

              {/* Form Actions — matches reference button style */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginTop:"8px" }}>
                <button
                  type="submit"
                  style={BTN_PRIMARY_MD}
                  onMouseEnter={hoverPrimary}
                  onMouseLeave={unhoverPrimary}
                >
                  <span style={ICON_SM}><PlusIcon /></span>
                  Create Case
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={BTN_GHOST_MD}
                  onMouseEnter={hoverGhost}
                  onMouseLeave={unhoverGhost}
                >
                  <span style={ICON_SM}><XIcon /></span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{
            background: "rgba(192,57,43,0.1)",
            border: "1px solid rgba(192,57,43,0.3)",
            borderRadius: "3px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#f87171",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "13px",
          }}>
            {error}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0" }}>
            <div style={{
              width: "32px", height: "32px",
              border: "2px solid var(--gold)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ marginTop:"12px", fontFamily:"Rajdhani,sans-serif", fontSize:"12px", color:"var(--muted)", letterSpacing:"1px" }}>
              Loading cases...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* ════ SECTION B: FILTER ROW ════ */}
            <div style={{ display:"flex", gap:"12px", marginBottom:"20px", alignItems:"center" }}>

              {/* Search */}
              <div style={{ flex:1, position:"relative" }}>
                <span style={{
                  position:"absolute", left:"15px", top:"50%", transform:"translateY(-50%)",
                  width:"16px", height:"16px", color:"var(--muted)", pointerEvents:"none",
                  display:"flex", alignItems:"center",
                }}>
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "0 16px 0 46px",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...selectStyle, minWidth:"140px", width:"auto" }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Disposed</option>
                <option>Closed</option>
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ ...selectStyle, minWidth:"140px", width:"auto" }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(200,168,75,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
              >
                <option>All Types</option>
                <option>Civil</option>
                <option>Criminal</option>
                <option>Family</option>
                <option>Corporate</option>
                <option>Property</option>
                <option>Other</option>
              </select>
            </div>

            {/* ════ SECTION C: CASES TABLE ════ */}
            {filteredCases.length > 0 && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                overflow: "hidden",
              }}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid var(--border)" }}>
                        {[
                          { label:"Case Title", width:"30%" },
                          { label:"Client",     width:"15%" },
                          { label:"Court",      width:"24%" },
                          { label:"Type",       width:"10%" },
                          { label:"Status",     width:"11%" },
                          { label:"Actions",    width:"10%" },
                        ].map(({ label, width }) => (
                          <th key={label} style={{
                            width,
                            padding: "0 16px",
                            height: "44px",
                            textAlign: "left",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                            verticalAlign: "middle",
                          }}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCases.map((item, idx) => {
                        const id = item._id || item.id;
                        return (
                          <tr
                            key={id}
                            style={{
                              borderBottom: idx === filteredCases.length - 1 ? "none" : "1px solid rgba(180,150,80,0.08)",
                              borderLeft: "3px solid transparent",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={hoverRow}
                            onMouseLeave={unhoverRow}
                          >
                            {/* Case Title + Number */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle", overflow:"hidden" }}>
                              <p style={{ fontFamily:"Rajdhani,sans-serif", fontSize:"14px", fontWeight:600, color:"var(--white)" }}>
                                {item.case_title}
                              </p>
                              <p style={{ marginTop:"3px", fontFamily:"JetBrains Mono,monospace", fontSize:"11px", color:"var(--gold)" }}>
                                {item.case_number || "—"}
                              </p>
                            </td>

                            {/* Client */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle", fontFamily:"Rajdhani,sans-serif", fontSize:"13px", fontWeight:400, color:"var(--muted)" }}>
                              {item.client_name || "—"}
                            </td>

                            {/* Court */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle", fontFamily:"Rajdhani,sans-serif", fontSize:"13px", color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {item.court_name || "—"}
                            </td>

                            {/* Type badge */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle" }}>
                              <span className="badge badge-disposed">{item.case_type || "Other"}</span>
                            </td>

                            {/* Status badge */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle" }}>
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {(item.status || "Disposed").toUpperCase()}
                              </span>
                            </td>

                            {/* Actions — VIEW + DELETE matching reference */}
                            <td style={{ padding:"0 16px", height:"60px", verticalAlign:"middle" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>

                                {/* VIEW — matches reference: btn-primary small */}
                                <Link
                                  to={`/cases/${id}`}
                                  style={{
                                    ...BTN_PRIMARY,
                                    color: "var(--bg, #0a1210)",
                                  }}
                                  onMouseEnter={hoverPrimary}
                                  onMouseLeave={unhoverPrimary}
                                >
                                  <span style={ICON_SM}><EyeIcon /></span>
                                  View
                                </Link>

                                {/* DELETE — icon-only danger */}
                                <button
                                  onClick={() => deleteCase(id)}
                                  style={BTN_DANGER}
                                  title="Delete case"
                                  onMouseEnter={hoverDanger}
                                  onMouseLeave={unhoverDanger}
                                >
                                  <span style={ICON_MD}><TrashIcon /></span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════ EMPTY STATE ════ */}
        {!loading && filteredCases.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 24px",
            minHeight: "300px",
            textAlign: "center",
          }}>
            {/* icon circle */}
            <div style={{
              width:"56px", height:"56px", borderRadius:"50%",
              background:"var(--gold-dim, rgba(200,168,75,0.1))",
              border:"1px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"center",
              marginBottom:"16px",
            }}>
              <span style={{ width:"24px", height:"24px", color:"var(--gold)", display:"flex" }}>
                <FolderIcon />
              </span>
            </div>

            <h3 style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "20px", fontWeight: 600,
              color: "var(--white)",
              marginBottom: "8px",
            }}>
              No cases found
            </h3>

            <p style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "13px", fontWeight: 400,
              color: "var(--muted)",
              marginBottom: "20px",
              maxWidth: "260px",
              lineHeight: 1.5,
            }}>
              {search || statusFilter !== "All Status" || typeFilter !== "All Types"
                ? "No cases match your current filters."
                : "Get started by creating your first case."}
            </p>

            {/* Create button — same style as header button */}
            {!search && statusFilter === "All Status" && typeFilter === "All Types" && (
              <button
                onClick={() => setShowForm(true)}
                style={BTN_PRIMARY_MD}
                onMouseEnter={hoverPrimary}
                onMouseLeave={unhoverPrimary}
              >
                <span style={ICON_SM}><PlusIcon /></span>
                Create Case
              </button>
            )}
          </div>
        )}

      </div>{/* /app-body */}

      {/* spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Cases;