import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 6V4h8v2" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="6" width="12" height="14" rx="2" strokeWidth="1.8" />
      <path d="M10 10v6M14 10v6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7h5l2 2h11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchClient();
    fetchCases();
  }, []);

  const fetchClient = async () => {
    try {
      const res = await API.get(`/clients/${id}`);
      setClient(res.data);
      setFormData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
        address: res.data.address || "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("advocate");
        toast.error("Please login again");
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast.error("Client not found");
        navigate("/clients");
      } else {
        toast.error("Failed to load client");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await API.get(`/cases/client/${id}`);
      setCases(res.data);
    } catch (error) {
      console.error("Failed to load client cases:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      await API.put(`/clients/${id}`, formData);
      toast.success("Client updated successfully");
      setEditing(false);
      fetchClient();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update client");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this client? This will also delete all associated cases, hearings, and documents.")) return;
    try {
      await API.delete(`/clients/${id}`);
      toast.success("Client deleted successfully");
      navigate("/clients");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete client");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const getValue = (value) => (value && String(value).trim() ? value : <span className="detail-empty">—</span>);

  const getStatusClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (normalized === "active") return "completed";
    if (normalized === "pending" || normalized === "on hold" || normalized === "adjourned") return "adjourned";
    if (normalized === "closed" || normalized === "disposed" || normalized === "cancelled") return "disposed";
    return "scheduled";
  };

  const initials = (client?.name || "C").trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Client not found.</p>
        <Link to="/clients" className="detail-btn-ghost" style={{ textDecoration: "none" }}>
          <BackArrowIcon /> Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page-shell">
      <header className="app-header">
        <div className="app-header-title-wrap">
          <Link to="/clients" className="back-nav-link">
            <BackArrowIcon />
            Back to Clients
          </Link>
          <h1 className="app-header-title">Client Details</h1>
        </div>
        <div className="detail-header-actions">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="detail-btn-ghost" type="button">
                <PencilIcon /> Edit
              </button>
              <button onClick={handleDelete} className="detail-btn-danger" type="button">
                <TrashIcon /> Delete
              </button>
            </>
          )}
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData({
                  name: client.name || "",
                  phone: client.phone || "",
                  email: client.email || "",
                  address: client.address || "",
                });
              }}
              className="detail-btn-ghost"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </header>

      <div className="detail-content">
        {editing ? (
          <section className="detail-card with-corners" style={{ padding: "28px 32px", marginBottom: "24px" }}>
            <div className="detail-card-label">Edit Client</div>
            <form onSubmit={handleUpdate}>
              <div className="detail-info-grid">
                <div className="detail-field">
                  <label className="detail-field-label">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="detail-input" required />
                </div>
                <div className="detail-field">
                  <label className="detail-field-label">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="detail-input" required />
                </div>
                <div className="detail-field">
                  <label className="detail-field-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="detail-input" />
                </div>
                <div className="detail-field">
                  <label className="detail-field-label">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="detail-input" />
                </div>
              </div>
              <div className="detail-header-actions" style={{ marginTop: "20px" }}>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="detail-card with-corners" style={{ gridColumn: "1 / -1", padding: "28px 32px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "28px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid var(--border-2)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "9999px",
                    background: "var(--gold)",
                    border: "2px solid var(--gold2)",
                    color: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>{client.name}</h2>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--border)",
                      borderRadius: "2px",
                      padding: "3px 10px",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "11px",
                      color: "var(--gold)",
                    }}
                  >
                    ID: {client.id}
                  </span>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="detail-field">
                  <span className="detail-field-label">Name</span>
                  <span className="detail-field-value">{getValue(client.name)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Phone</span>
                  <span className="detail-field-value">{getValue(client.phone)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Email</span>
                  <span className="detail-field-value">{getValue(client.email)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Address</span>
                  <span className="detail-field-value">{getValue(client.address)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Created</span>
                  <span className="detail-field-value">{formatDate(client.created_at)}</span>
                </div>
              </div>
            </section>

            <section style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600 }}>Associated Cases</h3>
                <Link to="/cases" className="btn-primary" style={{ minHeight: "34px", height: "34px", padding: "0 14px", fontSize: "10px" }}>
                  + New Case
                </Link>
              </div>

              <div className="detail-card" style={{ padding: 0, overflow: "hidden" }}>
                {cases.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "9999px",
                        background: "var(--gold-dim)",
                        border: "1px solid var(--border)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--gold)",
                      }}
                    >
                      <FolderIcon />
                    </div>
                    <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600 }}>No cases found</p>
                    <p style={{ color: "var(--muted)", fontSize: "12px" }}>No cases have been linked to this client yet.</p>
                    <Link to="/cases" className="btn-primary" style={{ minHeight: "34px", height: "34px", padding: "0 14px", fontSize: "10px" }}>
                      Create First Case
                    </Link>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="table" style={{ tableLayout: "auto" }}>
                      <thead>
                        <tr>
                          <th>Case Title</th>
                          <th>Case #</th>
                          <th>Court</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((caseItem) => (
                          <tr key={caseItem.id}>
                            <td>{caseItem.case_title || <span className="detail-empty">—</span>}</td>
                            <td>
                              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--muted)" }}>
                                {caseItem.case_number || "—"}
                              </span>
                            </td>
                            <td>{caseItem.court_name || <span className="detail-empty">—</span>}</td>
                            <td>
                              <span className={`detail-status-badge ${getStatusClass(caseItem.status)}`}>{caseItem.status || "Pending"}</span>
                            </td>
                            <td>
                              <Link to={`/cases/${caseItem.id}`} className="detail-btn-ghost" style={{ textDecoration: "none", height: "34px" }}>
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
