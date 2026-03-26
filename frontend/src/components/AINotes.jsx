import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AINotes({ caseId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [mainPointsText, setMainPointsText] = useState("");
  const [includeCaseNotes, setIncludeCaseNotes] = useState(true);
  const [savedCaseNotesCount, setSavedCaseNotesCount] = useState(0);

  useEffect(() => {
    fetchNotes();
    fetchSavedCaseNotesCount();
  }, [caseId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/ai/notes/${caseId}`);
      setNotes(res.data);
      if (res.data.length > 0) setExpanded(res.data[0].id);
    } catch (error) {
      console.error("Error fetching AI notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCaseNotesCount = async () => {
    try {
      const res = await API.get(`/notes/${caseId}`);
      setSavedCaseNotesCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (error) {
      setSavedCaseNotesCount(0);
    }
  };

  const generateInsights = async () => {
    try {
      const mainPoints = mainPointsText
        .split("\n")
        .map((point) => point.trim())
        .filter(Boolean);

      if (!notesText.trim() && mainPoints.length === 0 && !includeCaseNotes) {
        toast.error("Add notes or main points to generate AI analysis");
        return;
      }

      setGenerating(true);
      const res = await API.post(`/ai/generate/${caseId}`, {
        notesText,
        mainPoints,
        includeCaseNotes,
      });
      toast.success("AI insights generated!");
      setNotes((prev) => [
        {
          id: res.data.id,
          content: res.data.content,
          model_used: res.data.model_used,
          tokens_used: res.data.tokens_used,
          created_at: res.data.created_at,
        },
        ...prev,
      ]);
      setExpanded(res.data.id);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to generate AI insights";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this AI analysis?")) return;
    try {
      await API.delete(`/ai/notes/${id}`);
      toast.success("AI note deleted");
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (error) {
      toast.error("Failed to delete AI note");
    }
  };

  // Parse AI content into sections for styled rendering
  const renderContent = (content) => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements = [];
    let currentSection = null;
    let currentItems = [];

    const flushSection = () => {
      if (currentSection) {
        elements.push(
          <div key={elements.length} className="mb-5">
            <h3 className="text-xs font-bold tracking-wider text-gold mb-2">{currentSection}</h3>
            <div className="text-sm text-slate-300 leading-relaxed space-y-1">
              {currentItems.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          </div>
        );
        currentSection = null;
        currentItems = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect section headers (various formats)
      const isHeader =
        /^#+\s/.test(trimmed) ||
        /^\d+\.\s*[A-Z]{2,}/.test(trimmed) ||
        /^[A-Z][A-Z\s&]{3,}$/.test(trimmed) ||
        /^\*\*[A-Z]/.test(trimmed);

      if (isHeader) {
        flushSection();
        currentSection = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/^[\d.]+\s*/, "");
        continue;
      }

      // Detect separator lines
      if (/^[-=]{3,}$/.test(trimmed)) continue;

      // Clean bullet points
      const cleaned = trimmed.replace(/^[-•*]\s*/, "• ").replace(/^\d+\.\s/, "");
      currentItems.push(cleaned);
    }
    flushSection();

    return elements.length > 0 ? elements : <p className="text-sm text-slate-300 whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="detail-card" style={{ padding: "24px" }}>
      <div
        style={{
          border: "1px solid rgba(200, 168, 75, 0.2)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "18px",
          background: "rgba(15, 23, 42, 0.35)",
        }}
      >
        <h3 className="detail-card-label" style={{ marginBottom: "12px" }}>Notes and Main Points for AI</h3>
        <p className="text-xs text-slate-400" style={{ marginBottom: "12px" }}>
          Add your notes and key points. AI will analyze this content and generate a legal summary, relevant laws and sections, and practical next steps.
        </p>

        <div style={{ display: "grid", gap: "10px" }}>
          <div>
            <label className="detail-field-label" style={{ display: "block", marginBottom: "6px" }}>
              Detailed Notes
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add factual background, incident details, statements, dates, and procedural context..."
              rows={5}
              style={{ width: "100%", resize: "vertical", minHeight: "110px" }}
              className="detail-select"
            />
          </div>

          <div>
            <label className="detail-field-label" style={{ display: "block", marginBottom: "6px" }}>
              Main Points (one point per line)
            </label>
            <textarea
              value={mainPointsText}
              onChange={(e) => setMainPointsText(e.target.value)}
              placeholder="Example:\nComplainant alleges breach of contract on 12 Jan 2026\nNotice served but no response received"
              rows={4}
              style={{ width: "100%", resize: "vertical", minHeight: "90px" }}
              className="detail-select"
            />
          </div>

          <label className="text-xs text-slate-300" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={includeCaseNotes}
              onChange={(e) => setIncludeCaseNotes(e.target.checked)}
            />
            Include saved case notes from system ({savedCaseNotesCount})
          </label>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg className="w-4.5 h-4.5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h2 className="detail-card-label" style={{ marginBottom: 0 }}>AI Legal Analysis</h2>
        </div>
        <button
          onClick={generateInsights}
          disabled={generating}
          className={`detail-btn-ghost ${generating ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ height: "34px", padding: "0 14px", color: generating ? "var(--muted)" : "var(--gold)", background: "var(--gold-dim)" }}
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-500 border-t-transparent"></div>
              ANALYZING...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              GENERATE AI INSIGHTS
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && notes.length === 0 && (
        <div
          style={{
            border: "1px dashed rgba(200, 168, 75, 0.25)",
            borderRadius: "3px",
            padding: "20px",
            minHeight: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg className="mx-auto w-5 h-5 text-gold/40 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-slate-400 text-sm">No AI analysis generated yet.</p>
        </div>
      )}

      {/* Notes list */}
      {!loading && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="border border-gold/10 rounded-lg overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary/50 hover:bg-primary/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${expanded === note.id ? "bg-gold" : "bg-slate-600"}`}></div>
                  <span className="text-xs font-bold tracking-wider text-white">
                    AI ANALYSIS — {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {note.model_used} · {note.tokens_used} tokens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="text-red-400/60 hover:text-red-400 text-[10px] font-bold tracking-wider px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  >
                    DELETE
                  </button>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform ${expanded === note.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Accordion body */}
              {expanded === note.id && (
                <div className="px-5 py-4 border-t border-gold/5">
                  {renderContent(note.content)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
