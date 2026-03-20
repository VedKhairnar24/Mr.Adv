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

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

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
      <header
        style={{
          padding: "28px 40px 20px",
          borderBottom: "1px solid rgba(180, 150, 80, 0.08)",
          background: "rgba(10, 18, 16, 0.5)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "32px",
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--white)",
            }}
          >
            Hearings
          </h1>
          <p
            style={{
              marginTop: "4px",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--muted)",
            }}
          >
            Track all court dates and hearing schedules
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Hearing
        </button>
      </header>

      <div style={{ padding: "32px 40px" }}>
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 6px",
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
                  fontSize: "20px",
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
                    bottom: "6px",
                  }}
                ></span>
              )}
            </button>
          );
        })}
      </section>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search case, court, judge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              color: "var(--white)",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "14px",
              padding: "12px 16px 12px 44px",
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
            padding: "10px 14px",
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                        padding: "14px 16px",
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
                    <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                      <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 700, lineHeight: 1, color: "var(--white)" }}>
                        {day}
                      </p>
                      <p style={{ marginTop: "2px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--gold)" }}>
                        {month} · {time}
                      </p>
                    </td>

                    <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                      <Link to={`/cases/${h.case_id}`} style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--white)", textDecoration: "none" }}>
                        {h.case_title}
                      </Link>
                      {h.case_number && <p style={{ marginTop: "2px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--gold)" }}>{h.case_number}</p>}
                    </td>

                    <td style={{ padding: "14px 16px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                      {h.court_name || h.court_hall || "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                      {h.judge_name || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`badge ${stageBadgeClass(h.stage)}`}>{h.stage || "Other"}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`badge ${statusBadgeClass(h.status)}`}>
                        {h.status?.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Link
                          to={`/hearings/${h.id}`}
                          className="btn-ghost"
                          style={{ padding: "5px 12px", fontSize: "11px", color: "var(--gold)", borderColor: "rgba(200,168,75,0.35)", gap: "6px" }}
                        >
                          <span style={{ width: "13px", height: "13px" }}><EyeIcon /></span>
                          View
                        </Link>
                        <button onClick={() => deleteHearing(h.id)} className="btn-danger" style={{ padding: "10px" }} title="Delete hearing">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gold/10 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Hearing</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">CASE *</label>
                <select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                  className={inputClass} required>
                  <option value="">Select Case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">HEARING DATE *</label>
                  <input type="date" value={form.hearing_date} onChange={(e) => setForm({ ...form, hearing_date: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">TIME</label>
                  <input type="time" value={form.hearing_time} onChange={(e) => setForm({ ...form, hearing_time: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">COURT NAME</label>
                <input type="text" value={form.court_name} onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                  placeholder="e.g., District Court" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">JUDGE NAME</label>
                <input type="text" value={form.judge_name} onChange={(e) => setForm({ ...form, judge_name: e.target.value })}
                  placeholder="e.g., Justice Sharma" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">STAGE</label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
                  <option value="">Select Stage</option>
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NOTES</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Brief note about the hearing..." rows="3" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NEXT HEARING DATE</label>
                <input type="date" value={form.next_hearing_date} onChange={(e) => setForm({ ...form, next_hearing_date: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                    submitting ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
                  }`}>
                  {submitting ? "ADDING..." : "ADD HEARING"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded font-bold text-sm tracking-wider border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
