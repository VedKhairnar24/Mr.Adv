import { useEffect, useState } from "react";
import API from "../services/api";

function CaseTimeline({ caseId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
            id: `hearing-${h.id}`, type: "hearing",
            title: `Hearing ${h.status === "Completed" ? "Completed" : "Scheduled"}`,
            description: h.notes || `Court: ${h.court_hall || "N/A"} | Judge: ${h.judge_name || "N/A"}`,
            date: h.hearing_date, time: h.hearing_time, status: h.status, icon: "hearing",
          });
        });
      }

      if (docsRes.status === "fulfilled") {
        const docs = docsRes.value.data;
        (Array.isArray(docs) ? docs : []).forEach((d) => {
          timeline.push({
            id: `doc-${d.id}`, type: "document", title: "Document Uploaded",
            description: d.document_name, date: d.uploaded_at, icon: "document",
          });
        });
      }

      if (notesRes.status === "fulfilled") {
        const notes = notesRes.value.data;
        (Array.isArray(notes) ? notes : []).forEach((n) => {
          timeline.push({
            id: `note-${n.id}`, type: "note", title: "Note Added",
            description: n.note_text?.length > 100 ? n.note_text.substring(0, 100) + "..." : n.note_text,
            date: n.created_at, icon: "note",
          });
        });
      }

      timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(timeline);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

  const getIconColor = (type) => {
    switch (type) {
      case "hearing": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "document": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "note": return "bg-gold/20 text-gold border-gold/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "hearing":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "note":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-gold/10 mt-6">
        <h2 className="text-sm font-bold mb-4 text-white tracking-wide">CASE TIMELINE</h2>
        <div className="flex justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-gold/10 mt-6">
      <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CASE TIMELINE</h2>

      {events.length === 0 ? (
        <p className="text-slate-500 text-center py-8 text-sm">
          No timeline events yet. Hearings, documents, and notes will appear here.
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gold/20"></div>

          <div className="space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start pl-10">
                {/* Icon circle */}
                <div className={`absolute left-1.5 w-6 h-6 rounded-full border flex items-center justify-center ${getIconColor(event.type)}`}>
                  {getIcon(event.type)}
                </div>

                {/* Event card */}
                <div className="flex-1 bg-primary/60 rounded-lg p-4 border border-gold/5 hover:border-gold/15 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">{event.title}</h3>
                    <span className="text-[10px] text-slate-500 tracking-wide">
                      {formatDate(event.date)}
                      {event.time ? ` at ${formatTime(event.time)}` : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{event.description}</p>

                  {event.type === "hearing" && event.status && (
                    <span className={`inline-block mt-2 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                      event.status === "Completed"
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : event.status === "Adjourned"
                        ? "text-orange-400 border-orange-500/30 bg-orange-500/10"
                        : "text-blue-400 border-blue-500/30 bg-blue-500/10"
                    }`}>
                      {event.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseTimeline;
