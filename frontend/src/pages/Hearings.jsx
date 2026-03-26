import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export default function Hearings() {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Form state
  const [form, setForm] = useState({
    case_id: "", hearing_date: "", hearing_time: "", court_name: "",
    judge_name: "", stage: "", notes: "", next_hearing_date: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const stageOptions = ["Filing", "Evidence", "Argument", "Judgment", "Cross-Examination", "Mediation", "Other"];

  useEffect(() => {
    fetchHearings();
    fetchCases();
  }, []);

  const fetchHearings = async () => {
    try {
      const res = await API.get("/hearings/all");
      setHearings(res.data);
    } catch (error) {
      console.error("Error fetching hearings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await API.get("/cases/all");
      setCases(res.data);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.case_id || !form.hearing_date) {
      toast.error("Case and hearing date are required");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/hearings/add", form);
      toast.success("Hearing added successfully!");
      setForm({ case_id: "", hearing_date: "", hearing_time: "", court_name: "", judge_name: "", stage: "", notes: "", next_hearing_date: "" });
      setShowModal(false);
      fetchHearings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add hearing");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHearing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hearing?")) return;
    try {
      await API.delete(`/hearings/${id}`);
      toast.success("Hearing deleted");
      fetchHearings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hearing");
    }
  };

  const statusBadgeClass = (status = "") => {
    const value = status.toLowerCase();
    if (value === "scheduled") return "badge-scheduled";
    if (value === "completed") return "badge-completed";
    if (value === "adjourned") return "badge-adjourned";
    if (value === "cancelled") return "badge-cancelled";
    return "badge-scheduled";
  };

  const stageBadgeClass = (stage = "") => {
    if ((stage || "").toLowerCase() === "evidence") return "badge-pending";
    return "badge-disposed";
  };

  const filtered = hearings.filter((h) => {
    const matchSearch = search === "" ||
      h.case_title?.toLowerCase().includes(search.toLowerCase()) ||
      h.court_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.judge_name?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter === "" ||
      (h.hearing_date && h.hearing_date.startsWith(dateFilter));
    return matchSearch && matchDate;
  });

  const labelStyle = {
    display: "block",
    fontFamily: "Rajdhani, sans-serif",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "var(--gold)",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    height: "48px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "3px",
    color: "var(--white)",
    fontFamily: "Rajdhani, sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    padding: "0 14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c8a84b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "40px",
  };

  const buttonTextStyle = {
    fontFamily: "Rajdhani, sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
  };

  const onFocus = (e) => {
    e.target.style.borderColor = "rgba(200,168,75,0.5)";
  };

  const onBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const weekStrip = [
    { day: "MON", date: "17", iso: "2026-03-17" },
    { day: "TUE", date: "18", iso: "2026-03-18" },
    { day: "WED", date: "19", iso: "2026-03-19" },
    { day: "THU", date: "20", iso: "2026-03-20", today: true },
    { day: "FRI", date: "21", iso: "2026-03-21" },
    { day: "SAT", date: "22", iso: "2026-03-22" },
    { day: "SUN", date: "23", iso: "2026-03-23" },
  ];

  const hearingDateSet = new Set(
    hearings
      .map((h) => (h.hearing_date || "").slice(0, 10))
      .filter(Boolean)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-white/60 text-sm">Loading hearings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* SECTION A: HEADER BAR */}
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Hearings</h1>
          <p className="app-header-subtitle">Track all court dates and hearing schedules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Hearing
        </button>
      </header>

      <div className="app-body">
      {/* SECTION B: WEEK STRIP CALENDAR */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "3px",
          padding: "16px",
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {weekStrip.map((slot) => {
          const hasHearing = hearingDateSet.has(slot.iso);
          const isToday = Boolean(slot.today);
          return (
            <button
              type="button"
              key={slot.iso}
              style={{
                flex: 1,
                minWidth: "56px",
                height: "72px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 8px",
                borderRadius: "3px",
                border: isToday ? "1px solid rgba(200, 168, 75, 0.3)" : "1px solid transparent",
                background: isToday ? "var(--gold-dim)" : "transparent",
                position: "relative",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isToday) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isToday) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                {slot.day}
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: isToday ? "var(--gold)" : "var(--white)",
                  lineHeight: 1,
                }}
              >
                {slot.date}
              </span>
              {(isToday || hasHearing) && (
                <span
                  style={{
                    position: "absolute",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    bottom: "8px",
                  }}
                ></span>
              )}
            </button>
          );
        })}
      </section>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search case, court, judge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              color: "var(--white)",
              fontFamily: "Rajdhani, sans-serif",
            }}
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "3px",
            color: "var(--muted)",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            height: "48px",
            padding: "0 14px",
            minWidth: "180px",
          }}
        />
      </div>

      {/* SECTION D: HEARINGS TABLE */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "260px" }}>
          <div className="empty-icon" style={{ width: "48px", height: "48px", fontSize: "18px" }}>
            <CalendarIcon />
          </div>
          <h3 className="empty-title" style={{ fontSize: "18px" }}>No hearings found</h3>
          <p className="empty-text" style={{ fontSize: "12px" }}>Schedule a hearing to see it here</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table className="hearings-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Date",
                    "Case",
                    "Court",
                    "Judge",
                    "Stage",
                    "Status",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: "left",
                        padding: "0 16px",
                        height: "44px",
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, index) => {
                  const day = new Date(h.hearing_date).toLocaleDateString("en-IN", { day: "2-digit" });
                  const month = new Date(h.hearing_date).toLocaleDateString("en-IN", { month: "short" });
                  const time = h.hearing_time ? h.hearing_time.slice(0, 5) : "--:--";
                  return (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom: index === filtered.length - 1 ? "none" : "1px solid rgba(180, 150, 80, 0.08)",
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
                    <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                      <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: 700, lineHeight: 1, color: "var(--white)" }}>
                        {day}
                      </p>
                      <p style={{ marginTop: "4px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--gold)" }}>
                        {month} · {time}
                      </p>
                    </td>

                    <td style={{ padding: "0 16px", height: "60px", verticalAlign: "middle" }}>
                      <Link to={`/cases/${h.case_id}`} style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--white)", textDecoration: "none" }}>
                        {h.case_title}
                      </Link>
                      {h.case_number && <p style={{ marginTop: "2px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--gold)" }}>{h.case_number}</p>}
                    </td>

                    <td style={{ padding: "0 16px", height: "60px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                      {h.court_name || h.court_hall || "—"}
                    </td>
                    <td style={{ padding: "0 16px", height: "60px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                      {h.judge_name || "—"}
                    </td>
                    <td style={{ padding: "0 16px", height: "60px" }}>
                      <span className={`badge ${stageBadgeClass(h.stage)}`}>{h.stage || "Other"}</span>
                    </td>
                    <td style={{ padding: "0 16px", height: "60px" }}>
                      <span className={`badge ${statusBadgeClass(h.status)}`}>
                        {h.status?.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: "0 16px", height: "60px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "60px" }}>
                        <Link
                          to={`/hearings/${h.id}`}
                          className="btn-ghost"
                          style={{ height: "34px", minHeight: "34px", padding: "0 14px", fontSize: "10px", color: "var(--gold)", borderColor: "rgba(200,168,75,0.35)", gap: "6px" }}
                        >
                          <span style={{ width: "13px", height: "13px" }}><EyeIcon /></span>
                          View
                        </Link>
                        <button onClick={() => deleteHearing(h.id)} className="btn-danger" style={{ width: "34px", height: "34px", minHeight: "34px", padding: 0, justifyContent: "center" }} title="Delete hearing">
                          <span style={{ width: "14px", height: "14px" }}><TrashIcon /></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Add Hearing Modal */}
      {showModal && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(5,10,8,0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <style>{`
            @keyframes hearingModalIn {
              from { opacity: 0; transform: translateY(16px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .hearing-modal-card::-webkit-scrollbar {
              width: 4px;
            }

            .hearing-modal-card::-webkit-scrollbar-thumb {
              background: var(--border);
              border-radius: 3px;
            }

            .hearing-modal-card::-webkit-scrollbar-track {
              background: transparent;
            }

            .hearing-modal-field::placeholder,
            .hearing-modal-textarea::placeholder {
              color: var(--muted2);
              font-family: Rajdhani, sans-serif;
            }

            .hearing-modal-field[type="date"],
            .hearing-modal-field[type="time"] {
              color-scheme: dark;
            }

            .hearing-modal-field[type="date"]::-webkit-calendar-picker-indicator,
            .hearing-modal-field[type="time"]::-webkit-calendar-picker-indicator {
              filter: invert(0.7) sepia(1) saturate(2) hue-rotate(5deg);
              cursor: pointer;
              opacity: 0.7;
            }
          `}</style>

          <div
            onClick={(e) => e.stopPropagation()}
            className="hearing-modal-card"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "32px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,168,75,0.08)",
              animation: "hearingModalIn 0.25s ease-out",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                width: "20px",
                height: "20px",
                borderTop: "1px solid var(--gold)",
                borderLeft: "1px solid var(--gold)",
                opacity: 0.35,
                pointerEvents: "none",
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                width: "20px",
                height: "20px",
                borderBottom: "1px solid var(--gold)",
                borderRight: "1px solid var(--gold)",
                opacity: 0.35,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
                paddingBottom: "20px",
                borderBottom: "1px solid rgba(180,150,80,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "3px", height: "28px", background: "var(--gold)", borderRadius: "2px", flexShrink: 0 }} />
                <h2
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--white)",
                    lineHeight: 1,
                  }}
                >
                  Add Hearing
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "3px",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--danger)";
                  e.currentTarget.style.color = "var(--danger)";
                  e.currentTarget.style.background = "rgba(192,57,43,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Case <span style={{ color: "var(--gold)", marginLeft: "2px" }}>*</span></label>
                <select
                  value={form.case_id}
                  onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                <div>
                  <label style={labelStyle}>Hearing Date <span style={{ color: "var(--gold)", marginLeft: "2px" }}>*</span></label>
                  <input
                    type="date"
                    value={form.hearing_date}
                    onChange={(e) => setForm({ ...form, hearing_date: e.target.value })}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="hearing-modal-field"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Time</label>
                  <input
                    type="time"
                    value={form.hearing_time}
                    onChange={(e) => setForm({ ...form, hearing_time: e.target.value })}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="hearing-modal-field"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Court Name</label>
                <input
                  type="text"
                  value={form.court_name}
                  onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="e.g., District Court"
                  className="hearing-modal-field"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Judge Name</label>
                <input
                  type="text"
                  value={form.judge_name}
                  onChange={(e) => setForm({ ...form, judge_name: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="e.g., Justice Sharma"
                  className="hearing-modal-field"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={selectStyle}
                >
                  <option value="">Select Stage</option>
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Brief note about the hearing..."
                  className="hearing-modal-textarea"
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "96px",
                    padding: "12px 14px",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>Next Hearing Date</label>
                <input
                  type="date"
                  value={form.next_hearing_date}
                  onChange={(e) => setForm({ ...form, next_hearing_date: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  className="hearing-modal-field"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(180,150,80,0.12)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "24px",
                    height: "1px",
                    background: "var(--gold)",
                    opacity: 0.6,
                    marginRight: "4px",
                  }}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={buttonTextStyle}
                >
                  {submitting ? "Adding..." : "Add Hearing"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                  style={buttonTextStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
