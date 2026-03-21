import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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

/* Shared button style — same pattern as reference */
const btnStyle = {
  fontFamily:    'Rajdhani, sans-serif',
  fontSize:      '11px',
  fontWeight:    700,
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
};

function Cases() {
  const [cases,        setCases]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [showForm,     setShowForm]     = useState(false);
  const [formData,     setFormData]     = useState({
    client_id:  "",
    case_title: "",
    case_number:"",
    court_name: "",
    case_type:  "",
    filing_date:"",
  });

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      console.error("Error creating case:", err);
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
    if (v === "closed"  || v === "cancelled")                    return "badge-closed";
    if (v === "disposed")                                         return "badge-disposed";
    return "badge-disposed";
  };

  useEffect(() => { fetchCases(); }, []);

  const inputClass = "w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm";

  const filteredCases = cases.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === "" ||
      (item.case_title  || "").toLowerCase().includes(q) ||
      (item.client_name || "").toLowerCase().includes(q) ||
      (item.court_name  || "").toLowerCase().includes(q) ||
      (item.case_number || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "All Status" ||
      (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "All Types" ||
      (item.case_type || "Other").toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── SECTION A: HEADER BAR ── */}
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Cases</h1>
          <p className="app-header-subtitle">Manage your legal cases</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={btnStyle}
        >
          {showForm ? 'Cancel' : '+ New Case'}
        </button>
      </header>

      <div className="app-body">

        {/* ── CREATE CASE FORM ── */}
        {showForm && (
          <div className="card" style={{ borderRadius: "3px", padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Create New Case
            </h2>
            <form onSubmit={createCase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CLIENT ID *</label>
                  <input type="number" name="client_id" value={formData.client_id} onChange={handleInputChange} placeholder="Enter client ID" required className={inputClass} />
                  <p className="text-[10px] text-slate-600 mt-1">Note: Create clients first in the Clients page</p>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE TITLE *</label>
                  <input type="text" name="case_title" value={formData.case_title} onChange={handleInputChange} placeholder="e.g., Smith v. Johnson" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE NUMBER</label>
                  <input type="text" name="case_number" value={formData.case_number} onChange={handleInputChange} placeholder="e.g., CV-2024-001" className={inputClass} />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">COURT NAME *</label>
                  <input type="text" name="court_name" value={formData.court_name} onChange={handleInputChange} placeholder="e.g., High Court of Delhi" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE TYPE</label>
                  <select name="case_type" value={formData.case_type} onChange={handleInputChange} className={inputClass}>
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
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">FILING DATE</label>
                  <input type="date" name="filing_date" value={formData.filing_date} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary"
                  style={btnStyle}
                >
                  Create Case
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost"
                  style={btnStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
              <p className="mt-3" style={{ color: "var(--muted)", fontFamily: "Rajdhani, sans-serif", fontSize: "12px" }}>
                Loading cases...
              </p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* ── SECTION B: FILTER ROW ── */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>

              {/* Search */}
              <div style={{ flex: 1, position: "relative" }}>
                <span className="search-icon"><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  style={{
                    width: "100%",
                    background: "var(--surface)",
                    border: "var(--border-1)",
                    borderRadius: "3px",
                    color: "var(--white)",
                    fontFamily: "Rajdhani, sans-serif",
                  }}
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--muted)",
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "48px",
                  minWidth: "140px",
                  padding: "0 14px",
                }}
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
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--muted)",
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "48px",
                  minWidth: "140px",
                  padding: "0 14px",
                }}
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

            {/* ── SECTION C: CASES TABLE ── */}
            {filteredCases.length > 0 && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "3px",
                overflow: "hidden",
              }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Case Title", "Client", "Court", "Type", "Status", "Actions"].map((h) => (
                          <th key={h} style={{
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
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCases.map((item, index) => {
                        const id = item._id || item.id;
                        return (
                          <tr
                            key={id}
                            style={{
                              borderBottom: index === filteredCases.length - 1 ? "none" : "1px solid rgba(180,150,80,0.08)",
                              borderLeft: "3px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                              e.currentTarget.style.borderLeftColor = "var(--gold)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.borderLeftColor = "transparent";
                            }}
                          >
                            {/* Case Title + Number */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                              <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--white)" }}>
                                {item.case_title}
                              </p>
                              <p style={{ marginTop: "3px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--gold)" }}>
                                {item.case_number || "—"}
                              </p>
                            </td>

                            {/* Client */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                              {item.client_name || "—"}
                            </td>

                            {/* Court */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.court_name || "—"}
                            </td>

                            {/* Type */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                              <span className="badge badge-disposed">{item.case_type || "Other"}</span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {(item.status || "Disposed").toUpperCase()}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                                {/* VIEW — btn-primary */}
                                <Link
                                  to={`/cases/${id}`}
                                  className="btn-primary"
                                  style={btnStyle}
                                >
                                  View
                                </Link>

                                {/* DELETE — btn-danger icon only */}
                                <button
                                  onClick={() => deleteCase(id)}
                                  className="btn-danger"
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    minHeight: "34px",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  title="Delete case"
                                >
                                  <span style={{ width: "14px", height: "14px", display: "flex" }}>
                                    <TrashIcon />
                                  </span>
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

        {/* ── EMPTY STATE ── */}
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
            <div style={{
              width: "56px", height: "56px",
              borderRadius: "50%",
              background: "var(--gold-dim, rgba(200,168,75,0.1))",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "16px",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600, color: "var(--white)", marginBottom: "8px" }}>
              No cases found
            </h3>
            <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)", marginBottom: "20px", maxWidth: "260px", lineHeight: 1.5 }}>
              {search || statusFilter !== "All Status" || typeFilter !== "All Types"
                ? "No cases match your current filters."
                : "Get started by creating your first case."}
            </p>

            {!search && statusFilter === "All Status" && typeFilter === "All Types" && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
                style={btnStyle}
              >
                + Create Case
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Cases;