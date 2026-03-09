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

      // Fetch hearings, documents, and notes in parallel
      const [hearingsRes, docsRes, notesRes] = await Promise.allSettled([
        API.get(`/hearings/${caseId}`),
        API.get(`/documents/case/${caseId}`),
        API.get(`/notes/${caseId}`),
      ]);

      const timeline = [];

      // Add hearings to timeline
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

      // Add documents to timeline
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
          });
        });
      }

      // Add notes to timeline
      if (notesRes.status === "fulfilled") {
        const notes = notesRes.value.data;
        (Array.isArray(notes) ? notes : []).forEach((n) => {
          timeline.push({
            id: `note-${n.id}`,
            type: "note",
            title: "Note Added",
            description:
              n.note_text?.length > 100
                ? n.note_text.substring(0, 100) + "..."
                : n.note_text,
            date: n.created_at,
            icon: "note",
          });
        });
      }

      // Sort by date descending (newest first)
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
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    // timeStr could be "HH:MM:SS" from MySQL
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

  const getIconBg = (type) => {
    switch (type) {
      case "hearing":
        return "bg-purple-500";
      case "document":
        return "bg-blue-500";
      case "note":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "hearing":
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "note":
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Case Timeline</h2>
        <div className="flex justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        📋 Case Timeline
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No timeline events yet. Hearings, documents, and notes will appear here.
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start pl-10">
                {/* Icon circle */}
                <div
                  className={`absolute left-1.5 w-6 h-6 rounded-full flex items-center justify-center ${getIconBg(
                    event.type
                  )}`}
                >
                  {getIcon(event.type)}
                </div>

                {/* Event card */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(event.date)}
                      {event.time ? ` at ${formatTime(event.time)}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>

                  {/* Hearing-specific status badge */}
                  {event.type === "hearing" && event.status && (
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        event.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : event.status === "Adjourned"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
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
