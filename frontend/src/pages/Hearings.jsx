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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchHearings();
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

  const triggerSyncForCase = async (caseId) => {
    try {
      await API.post(`/hearings/sync/trigger/${caseId}`);
      toast.success("Sync started");
      fetchHearings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    }
  };

  // Manual hearing deletion is disabled (hearings are auto-synced from public data).

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
          <p className="app-header-subtitle">Auto-synced from public Indian judicial case data</p>
        </div>
      </header>

      <div className="app-body">
      <div
        style={{
          marginBottom: "18px",
          padding: "12px 14px",
          border: "1px solid rgba(200,168,75,0.25)",
          background: "rgba(200,168,75,0.06)",
          borderRadius: "3px",
          color: "var(--muted)",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "12px",
        }}
      >
        Hearings are fetched automatically for cases added via CNR / case number. Manual hearing entry is disabled.
      </div>
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
          <p className="empty-text" style={{ fontSize: "12px" }}>Import a case via CNR to auto-populate hearings</p>
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
                        <button
                          onClick={() => triggerSyncForCase(h.case_id)}
                          className="btn-ghost"
                          style={{ height: "34px", minHeight: "34px", padding: "0 12px", fontSize: "10px" }}
                          title="Sync hearings for this case"
                        >
                          Sync
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
    </div>
  );
}
