import { useEffect, useState } from "react";
import API from "../services/api";

function CaseTimeline({ caseId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!caseId) return;
    loadTimeline();
  }, [caseId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const [hearingsRes, docsRes, notesRes] = await Promise.allSettled([
        API.get(`/hearings/${caseId}`),
        API.get(`/documents/case/${caseId}`),
        API.get(`/notes/${caseId}`),
      ]);

      const timeline = [];

      if (hearingsRes.status === "fulfilled") {
        const hearings = hearingsRes.value.data;
        (Array.isArray(hearings) ? hearings : []).forEach((h) => {
          timeline.push({
            id: `hearing-${h.id}`,
            type: "hearing",
            title: `Hearing ${h.status === "Completed" ? "Completed" : "Scheduled"}`,
            description: h.notes || `Court: ${h.court_hall || "N/A"} | Judge: ${h.judge_name || "N/A"}`,
            date: h.hearing_date,
            time: h.hearing_time,
            status: h.status,
            icon: "hearing",
          });
        });
      }

      if (docsRes.status === "fulfilled") {
        const docs = docsRes.value.data;
        (Array.isArray(docs) ? docs : []).forEach((d) => {
          timeline.push({
            id: `doc-${d.id}`,
            type: "document",
            title: "Document Uploaded",
            description: d.document_name,
            date: d.uploaded_at,
            icon: "document",
            fileType: d.document_name?.split(".").pop()?.toLowerCase() || "pdf",
          });
        });
      }

      if (notesRes.status === "fulfilled") {
        const notes = notesRes.value.data;
        (Array.isArray(notes) ? notes : []).forEach((n) => {
          timeline.push({
            id: `note-${n.id}`,
            type: "note",
            title: "Note Added",
            description: n.note_text?.length > 100 ? n.note_text.substring(0, 100) + "..." : n.note_text,
            date: n.created_at,
            icon: "note",
          });
        });
      }

      timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(timeline);
    } catch (error) {
      console.error("❌ Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0]);
      const m = parts[1];
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    }
    return timeStr;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "hearing":
        return "HEARING";
      case "document":
        return "DOCUMENT";
      case "note":
        return "NOTE";
      default:
        return "EVENT";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "hearing":
        return "#a855f7"; // purple
      case "document":
        return "#3b82f6"; // blue
      case "note":
        return "#c8a84b"; // gold
      default:
        return "#64748b"; // slate
    }
  };

  const getTypeGradient = (type) => {
    switch (type) {
      case "hearing":
        return "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)";
      case "document":
        return "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)";
      case "note":
        return "linear-gradient(135deg, rgba(200, 168, 75, 0.15) 0%, rgba(200, 168, 75, 0.05) 100%)";
      default:
        return "linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(100, 116, 139, 0.05) 100%)";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "hearing":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "document":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "note":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className="detail-card"
        style={{
          marginTop: "32px",
          marginBottom: "32px",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)",
          border: "1px solid rgba(200, 168, 75, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="detail-card-label">Case Timeline</div>
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gold border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="detail-card"
      style={{
        marginTop: "32px",
        marginBottom: "32px",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)",
        border: "1px solid rgba(200, 168, 75, 0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "28px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(200, 168, 75, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.05) 100%)",
              border: "1px solid rgba(200, 168, 75, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              style={{ color: "var(--gold)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="detail-card-label" style={{ marginBottom: "2px", letterSpacing: "0.5px" }}>
              Case Timeline
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
              {events.length} {events.length === 1 ? "event" : "events"}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        {events.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#cbd5e1",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 600,
                color: "#22c55e",
              }}
            >
              {events.filter((e) => e.status === "Completed").length}
            </div>
            <span style={{ opacity: 0.7 }}>Complete</span>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      {events.length === 0 ? (
        <div
          style={{
            padding: "60px 40px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.2) 100%)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(200, 168, 75, 0.1) 0%, rgba(200, 168, 75, 0.02) 100%)",
              border: "1px solid rgba(200, 168, 75, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              style={{ color: "rgba(200, 168, 75, 0.4)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1", marginBottom: "8px" }}>
            No events yet
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
            Hearings, documents, and notes will appear here as they are added
          </p>
        </div>
      ) : (
        <div
          className="relative"
          style={{
            padding: "20px 0",
          }}
        >
          {/* Animated Vertical Timeline - Perfectly Centered */}
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: "-24px",
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(200, 168, 75, 0) 2%,
                rgba(200, 168, 75, 0.3) 5%,
                rgba(200, 168, 75, 0.6) 50%,
                rgba(200, 168, 75, 0.3) 95%,
                rgba(200, 168, 75, 0) 98%,
                transparent 100%)`,
              boxShadow: `0 0 30px rgba(200, 168, 75, 0.4), 
                         inset 0 0 20px rgba(200, 168, 75, 0.2)`,
              borderRadius: "99px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingLeft: "48px" }}>
            {events.map((event, index) => (
              <div
                key={event.id}
                className="flex items-start gap-4 group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.06}s backwards`,
                  opacity: 1,
                }}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Timeline Node - Flexbox Centered */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-300"
                  style={{
                    width: "32px",
                    height: "32px",
                    marginLeft: "-40px",
                    marginRight: "8px",
                    background: hoveredId === event.id ? getTypeGradient(event.type) : `linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.02) 100%)`,
                    borderColor: getTypeColor(event.type),
                    color: getTypeColor(event.type),
                    boxShadow:
                      hoveredId === event.id
                        ? `0 0 20px ${getTypeColor(event.type)}60, inset 0 1px 3px rgba(255,255,255,0.2)`
                        : `0 0 8px ${getTypeColor(event.type)}30, inset 0 1px 2px rgba(255,255,255,0.1)`,
                    transform: hoveredId === event.id ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {getIcon(event.type)}
                </div>

                {/* Event Card */}
                <div
                  className="flex-1 rounded-lg transition-all duration-300 cursor-pointer"
                  style={{
                    background:
                      hoveredId === event.id
                        ? `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.7) 100%)`
                        : `linear-gradient(135deg, rgba(25, 35, 51, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%)`,
                    border: `1.5px solid ${hoveredId === event.id ? "rgba(200, 168, 75, 0.4)" : "rgba(200, 168, 75, 0.08)"}`,
                    boxShadow:
                      hoveredId === event.id
                        ? `0 12px 32px rgba(200, 168, 75, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(200, 168, 75, 0.1)`
                        : `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(200, 168, 75, 0.05)`,
                    padding: "16px",
                    transform: hoveredId === event.id ? "translateX(4px)" : "translateX(0)",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      {/* Type Badge */}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "8px",
                          fontWeight: 700,
                          letterSpacing: "1.2px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background: `${getTypeColor(event.type)}15`,
                          color: getTypeColor(event.type),
                          border: `1px solid ${getTypeColor(event.type)}30`,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                        }}
                      >
                        {getTypeLabel(event.type)}
                      </span>

                      {/* Title */}
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#f1f5f9",
                            margin: 0,
                            letterSpacing: "0.3px",
                            lineHeight: "1.4",
                          }}
                        >
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    {/* Date Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#cbd5e1",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: "rgba(200, 168, 75, 0.05)",
                        border: "1px solid rgba(200, 168, 75, 0.1)",
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(event.date)}
                      {event.time && <span style={{ marginLeft: "4px", opacity: 0.8 }}>• {formatTime(event.time)}</span>}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#cbd5e1",
                      lineHeight: "1.5",
                      margin: "10px 0 0 0",
                      wordBreak: "break-word",
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Status Badge for Hearings */}
                  {event.type === "hearing" && event.status && (
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          background:
                            event.status === "Completed"
                              ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%)"
                              : event.status === "Scheduled"
                              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)"
                              : event.status === "Adjourned"
                              ? "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)"
                              : "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)",
                          color:
                            event.status === "Completed"
                              ? "#22c55e"
                              : event.status === "Scheduled"
                              ? "#3b82f6"
                              : event.status === "Adjourned"
                              ? "#f97316"
                              : "#a78bfa",
                          border:
                            event.status === "Completed"
                              ? "1px solid #22c55e40"
                              : event.status === "Scheduled"
                              ? "1px solid #3b82f640"
                              : event.status === "Adjourned"
                              ? "1px solid #f9731640"
                              : "1px solid #a78bfa40",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background:
                              event.status === "Completed"
                                ? "#22c55e"
                                : event.status === "Scheduled"
                                ? "#3b82f6"
                                : event.status === "Adjourned"
                                ? "#f97316"
                                : "#a78bfa",
                          }}
                        />
                        {event.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          /* Responsive adjustments for smaller screens */
        }

        @media (max-width: 640px) {
          /* Mobile adjustments */
        }
      `}</style>
    </div>
  );
}

export default CaseTimeline;
