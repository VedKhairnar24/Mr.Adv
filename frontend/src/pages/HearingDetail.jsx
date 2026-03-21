import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 2v4M16 2v4M4 9h16M5 4h14a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HearingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const stageOptions = ["Filing", "Evidence", "Argument", "Judgment", "Cross-Examination", "Mediation", "Other"];
  const statusOptions = ["Scheduled", "Completed", "Adjourned", "Cancelled"];

  const statusClass = useMemo(() => {
    const status = (hearing?.status || "").toLowerCase();
    if (status === "completed") return "completed";
    if (status === "adjourned") return "adjourned";
    if (status === "cancelled") return "cancelled";
    return "scheduled";
  }, [hearing?.status]);

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const asDateInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  const getValue = (value) => (value && String(value).trim() ? value : <span className="detail-empty">—</span>);

  const fetchHearing = async () => {
    try {
      const res = await API.get(`/hearings/detail/${id}`);
      setHearing(res.data);
      setForm({
        hearing_date: asDateInput(res.data.hearing_date),
        hearing_time: res.data.hearing_time || "",
        court_name: res.data.court_name || res.data.court_hall || "",
        court_hall: res.data.court_hall || "",
        judge_name: res.data.judge_name || "",
        stage: res.data.stage || "",
        notes: res.data.notes || "",
        next_hearing_date: asDateInput(res.data.next_hearing_date),
        status: res.data.status || "Scheduled",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load hearing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearing();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await API.put(`/hearings/${id}`, {
        hearing_date: form.hearing_date,
        hearing_time: form.hearing_time || null,
        court_name: form.court_name,
        court_hall: form.court_hall || null,
        judge_name: form.judge_name || null,
        stage: form.stage || null,
        notes: form.notes || null,
        next_hearing_date: form.next_hearing_date || null,
        status: form.status,
      });

      toast.success("Hearing updated successfully");
      setEditing(false);
      await fetchHearing();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update hearing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this hearing?")) return;

    try {
      await API.delete(`/hearings/${id}`);
      toast.success("Hearing deleted");
      navigate("/hearings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hearing");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading hearing details...</p>
        </div>
      </div>
    );
  }

  if (!hearing) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Hearing not found.</p>
        <Link to="/hearings" className="detail-btn-ghost" style={{ textDecoration: "none" }}>
          <BackArrowIcon /> Back to Hearings
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page-shell">
      <header className="app-header">
        <div className="app-header-title-wrap">
          <Link to="/hearings" className="back-nav-link">
            <BackArrowIcon />
            Back to Hearings
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 className="app-header-title">Hearing Details</h1>
            <span className={`detail-status-badge ${statusClass}`}>{hearing.status || "Scheduled"}</span>
          </div>
          <p className="app-header-subtitle">Manage hearing timeline, status, and notes</p>
        </div>

        <div className="detail-header-actions">
          <button type="button" className="detail-btn-ghost" onClick={() => setEditing((prev) => !prev)}>
            <PencilIcon /> {editing ? "Cancel" : "Edit"}
          </button>
          <button type="button" className="detail-btn-danger" onClick={handleDelete}>
            <TrashIcon /> Delete
          </button>
        </div>
      </header>

      <div className="detail-content detail-content-narrow">
        {!editing ? (
          <>
            <section className="detail-card with-corners" style={{ padding: "28px 32px", marginBottom: "20px" }}>
              <div className="detail-card-label" style={{ marginBottom: "24px" }}>Hearing Information</div>

              <div className="detail-info-grid" style={{ gap: "24px 60px" }}>
                <div className="detail-field">
                  <span className="detail-field-label">Case</span>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "var(--gold)" }}>
                    {getValue(hearing.case_title)}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                    {hearing.case_number || "—"}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Client</span>
                  <span className="detail-field-value">{getValue(hearing.client_name)}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Date</span>
                  <span className="detail-field-value">{formatDate(hearing.hearing_date)}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Time</span>
                  <span className="detail-field-value mono">{hearing.hearing_time ? hearing.hearing_time.slice(0, 5) : "—"}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Court</span>
                  <span className="detail-field-value">{getValue(hearing.court_name || hearing.court_hall)}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Judge</span>
                  <span className="detail-field-value">{getValue(hearing.judge_name)}</span>
                </div>
              </div>
            </section>

            <section className="detail-card" style={{ padding: "24px 32px", marginBottom: "20px" }}>
              <div className="detail-card-label">Stage & Notes</div>

              <div className="detail-field" style={{ gap: "8px" }}>
                <span className="detail-field-label">Stage</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: "fit-content",
                    border: "1px solid rgba(200,132,43,0.3)",
                    borderRadius: "2px",
                    background: "var(--amber-dim)",
                    padding: "6px 16px",
                    color: "#fbbf24",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {hearing.stage || "—"}
                </span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-2)", margin: "16px 0" }} />

              <div className="detail-field">
                <span className="detail-field-label">Notes</span>
                <div
                  style={{
                    border: "1px solid var(--border-2)",
                    borderRadius: "3px",
                    background: "var(--bg)",
                    padding: "12px 16px",
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {hearing.notes || "—"}
                </div>
              </div>
            </section>

            <section className="detail-card" style={{ padding: "24px 32px", marginBottom: "20px" }}>
              <div className="detail-card-label">Next Hearing</div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "3px",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--border)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gold)",
                  }}
                >
                  <CalendarIcon />
                </div>

                <div>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                    {formatDate(hearing.next_hearing_date)}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "4px" }}>
                    Next Court Date
                  </p>
                </div>
              </div>
            </section>

            <section style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "4px" }}>
              <button type="button" className="btn-primary" style={{ height: "44px", padding: "0 24px" }} onClick={() => setEditing(true)}>
                Update Status
              </button>
              <button type="button" className="detail-btn-ghost" style={{ height: "44px" }} onClick={() => setEditing(true)}>
                <PencilIcon /> Edit Hearing
              </button>
              <button type="button" className="detail-btn-danger" style={{ height: "44px" }} onClick={handleDelete}>
                <TrashIcon /> Delete Hearing
              </button>
            </section>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="detail-card with-corners" style={{ padding: "28px 32px" }}>
            <div className="detail-card-label">Edit Hearing</div>

            <div className="detail-info-grid" style={{ gap: "20px 24px" }}>
              <div className="detail-field">
                <label className="detail-field-label">Hearing Date</label>
                <input
                  type="date"
                  className="detail-input"
                  value={form.hearing_date || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, hearing_date: e.target.value }))}
                />
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Time</label>
                <input
                  type="time"
                  className="detail-input"
                  value={form.hearing_time || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, hearing_time: e.target.value }))}
                />
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Court Name</label>
                <input
                  className="detail-input"
                  value={form.court_name || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, court_name: e.target.value }))}
                />
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Judge Name</label>
                <input
                  className="detail-input"
                  value={form.judge_name || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, judge_name: e.target.value }))}
                />
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Stage</label>
                <select className="detail-select" value={form.stage || ""} onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value }))}>
                  <option value="">Select Stage</option>
                  {stageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Status</label>
                <select className="detail-select" value={form.status || "Scheduled"} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Next Hearing Date</label>
                <input
                  type="date"
                  className="detail-input"
                  value={form.next_hearing_date || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, next_hearing_date: e.target.value }))}
                />
              </div>

              <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
                <label className="detail-field-label">Notes</label>
                <textarea
                  className="detail-textarea"
                  value={form.notes || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="detail-header-actions" style={{ marginTop: "20px" }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="detail-btn-ghost" onClick={() => { setEditing(false); setForm({
                hearing_date: asDateInput(hearing.hearing_date),
                hearing_time: hearing.hearing_time || "",
                court_name: hearing.court_name || hearing.court_hall || "",
                court_hall: hearing.court_hall || "",
                judge_name: hearing.judge_name || "",
                stage: hearing.stage || "",
                notes: hearing.notes || "",
                next_hearing_date: asDateInput(hearing.next_hearing_date),
                status: hearing.status || "Scheduled",
              }); }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
