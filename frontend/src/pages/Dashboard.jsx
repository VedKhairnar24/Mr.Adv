import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 18c0-2.8 2.2-4.5 5.5-4.5S14.5 15.2 14.5 18" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 18c.2-2 1.6-3.4 4.2-3.8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7.5h7l2 2H21v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 7.5v-1.5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h3M8 17h6" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

export default function Dashboard() {
  const [clientCount, setClientCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [hearings, setHearings] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/dashboard");
      setClientCount(res.data.totalClients || 0);
      setCaseCount(res.data.totalCases || 0);
      setDocCount(res.data.totalDocuments || 0);
      setHearings(res.data.upcomingHearings || []);
      setRecentCases(res.data.recentCases || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const advocate = JSON.parse(localStorage.getItem("advocate") || "{}");
  const displayName = (advocate?.name || "ved khairnar").toLowerCase();

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ minHeight: "70vh" }}>
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8"
            style={{ border: "2px solid var(--gold)", borderTopColor: "transparent" }}
          ></div>
          <p className="mt-3" style={{ color: "var(--muted)", fontFamily: "Rajdhani, sans-serif", fontSize: "12px" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "TOTAL CLIENTS", value: clientCount, icon: UsersIcon },
    { label: "TOTAL CASES", value: caseCount, icon: FolderIcon },
    { label: "HEARINGS", value: hearings.length, icon: CalendarIcon },
    { label: "DOCUMENTS", value: docCount, icon: FileIcon },
  ];

  const getStatusClass = (status = "") => {
    const value = status.toLowerCase();
    if (value === "active" || value === "completed") return "badge-active";
    if (value === "pending" || value === "adjourned") return "badge-pending";
    if (value === "scheduled") return "badge-scheduled";
    if (value === "disposed") return "badge-disposed";
    if (value === "closed" || value === "cancelled") return "badge-closed";
    return "badge-disposed";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* SECTION A: TOP HEADER BAR */}
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
            Dashboard
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
            {formattedDate}
          </p>
        </div>
      </header>

      {/* SECTION B/C/D: MAIN BODY */}
      <div style={{ padding: "32px 40px" }}>
        {/* SECTION B: GREETING */}
        <p
          style={{
            marginBottom: "28px",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "14px",
            fontStyle: "italic",
            color: "var(--muted)",
          }}
        >
          Good morning, <span style={{ color: "var(--gold)", fontStyle: "normal" }}>{displayName}</span> — here&apos;s your practice overview.
        </p>

        {/* SECTION C: STAT CARDS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  padding: "24px",
                  overflow: "hidden",
                  position: "relative",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "var(--gold)",
                    opacity: 0.6,
                  }}
                ></div>

                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "3px",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--border)",
                    marginBottom: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gold)",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "inline-flex",
                    }}
                  >
                    <Icon />
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "44px",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-1px",
                    color: "var(--white)",
                  }}
                >
                  {item.value}
                </div>

                <p
                  style={{
                    marginTop: "6px",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {item.label}
                </p>
              </article>
            );
          })}
        </section>

        {/* SECTION D: BOTTOM 2-COLUMN */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: "24px",
          }}
        >
          {/* LEFT: Upcoming Hearings */}
          <div>
            <div className="flex-between mb-md">
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--white)",
                }}
              >
                Upcoming Hearings
              </h2>
              <Link
                to="/hearings"
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  textDecoration: "none",
                }}
              >
                View All →
              </Link>
            </div>

            <div className="card" style={{ padding: "24px", borderRadius: "3px" }}>
              {hearings.length === 0 ? (
                <div className="empty-state" style={{ minHeight: "220px", padding: "24px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                      color: "var(--gold)",
                    }}
                  >
                    <CalendarIcon />
                  </div>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "var(--white)" }}>
                    No upcoming hearings
                  </p>
                  <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                    Schedule a hearing to see it here
                  </p>
                </div>
              ) : (
                hearings.map((hearing, index) => {
                  const dateObj = new Date(hearing.hearing_date);
                  const day = dateObj.toLocaleDateString("en-IN", { day: "2-digit" });
                  const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
                  const courtText = hearing.court_name || hearing.court_hall || "Court";
                  const judgeText = hearing.judge_name || "Judge N/A";
                  const timeText = hearing.hearing_time ? hearing.hearing_time.slice(0, 5) : "--:--";

                  return (
                    <Link
                      key={hearing.id}
                      to={hearing.case_id ? `/cases/${hearing.case_id}` : "/hearings"}
                      style={{
                        display: "flex",
                        gap: "16px",
                        padding: "14px 0",
                        borderBottom: index !== hearings.length - 1 ? "1px solid var(--border)" : "none",
                        textDecoration: "none",
                      }}
                    >
                      <div style={{ minWidth: "44px", textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "Cormorant Garamond, serif",
                            fontSize: "26px",
                            lineHeight: 1,
                            fontWeight: 700,
                            color: "var(--gold)",
                          }}
                        >
                          {day}
                        </div>
                        <div
                          style={{
                            marginTop: "2px",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          {month}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--white)" }}>
                          {hearing.case_title || "Untitled Case"}
                        </p>
                        <p
                          style={{
                            marginTop: "3px",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "12px",
                            color: "var(--muted)",
                          }}
                        >
                          {courtText} · {judgeText}
                        </p>
                      </div>

                      <div
                        style={{
                          alignSelf: "center",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "11px",
                          color: "var(--gold)",
                          background: "var(--gold-dim)",
                          padding: "2px 8px",
                          borderRadius: "2px",
                          border: "1px solid rgba(200, 168, 75, 0.3)",
                        }}
                      >
                        {timeText}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Recent Cases */}
          <div>
            <div className="flex-between mb-md">
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--white)",
                }}
              >
                Recent Cases
              </h2>
              <Link
                to="/cases"
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  textDecoration: "none",
                }}
              >
                View All →
              </Link>
            </div>

            <div className="card" style={{ padding: "24px", borderRadius: "3px" }}>
              {recentCases.length === 0 ? (
                <div className="empty-state" style={{ minHeight: "220px", padding: "24px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                      color: "var(--gold)",
                    }}
                  >
                    <FolderIcon />
                  </div>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "var(--white)" }}>
                    No recent cases
                  </p>
                  <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                    New cases will appear here
                  </p>
                </div>
              ) : (
                recentCases.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/cases/${item.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom: index !== recentCases.length - 1 ? "1px solid var(--border)" : "none",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>
                        {item.case_title || "Untitled Case"}
                      </p>
                      <p
                        style={{
                          marginTop: "2px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "11px",
                          color: "var(--gold)",
                        }}
                      >
                        {item.case_number || "N/A"}
                      </p>
                    </div>

                    <span className={`badge ${getStatusClass(item.status)}`}>
                      {(item.status || "Disposed").toUpperCase()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}