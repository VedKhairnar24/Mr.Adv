import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AINotes({ caseId }) {
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [caseText, setCaseText] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const res = await API.get(`/documents/${caseId}`);
      const docs = Array.isArray(res.data) ? res.data : [];
      setDocuments(docs);
      // Auto-select all documents when they're loaded
      if (docs.length > 0) {
        setSelectedDocuments(docs.map(d => d.id));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  const toggleDocument = (docId) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const generateInsights = async () => {
    try {
      // Validate: at least one of document or text must be provided
      if (selectedDocuments.length === 0 && (!caseText || caseText.trim().length === 0)) {
        toast.error("Please either select documents or enter case information");
        return;
      }

      setGenerating(true);
      const payload = {
        documentIds: selectedDocuments.length > 0 ? selectedDocuments : [],
        caseText: caseText.trim() || null,
      };
      console.log("🚀 Sending AI request with:", payload);
      const res = await API.post(`/ai/generate/${caseId}`, payload);
      console.log("✓ AI response received:", res.data);
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
      console.error("❌ AI generation error:", {
        message: error.message,
        status: error.response?.status,
      });
      toast.error("Insights temporarily unavailable. Please retry.");
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

      // Clean markdown formatting from the line
      let cleanedLine = trimmed
        .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove **bold**
        .replace(/\*(.+?)\*/g, '$1')      // Remove *italic*
        .replace(/__(.+?)__/g, '$1')      // Remove __bold__
        .replace(/_(.+?)_/g, '$1')        // Remove _italic_
        .replace(/^#+\s*/, '')            // Remove # headers
        .replace(/^[-*]\s+/, '');         // Remove list markers

      // Detect section headers
      const isHeader =
        /^\d+\.\s*[A-Z]/.test(trimmed) ||  // "1. Case Summary"
        /^[A-Z][A-Z\s&\/]{3,}:?$/.test(trimmed) ||  // "CASE SUMMARY" or "KEY INSIGHTS:"
        /^(case summary|key insights|timeline|risks|missing information)/i.test(trimmed);

      if (isHeader) {
        flushSection();
        // Clean the header text
        currentSection = cleanedLine
          .replace(/^\d+\.\s*/, '')  // Remove "1. "
          .replace(/:$/, '')          // Remove trailing colon
          .trim();
        continue;
      }

      // Detect separator lines
      if (/^[-=]{3,}$/.test(trimmed)) continue;

      // Clean bullet points and add proper formatting
      const isBullet = /^[-]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed);
      if (isBullet) {
        const bulletText = cleanedLine.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '');
        currentItems.push(
          <div key={currentItems.length} className="flex items-start gap-2 ml-2">
            <span className="text-gold mt-1 flex-shrink-0">•</span>
            <span>{bulletText}</span>
          </div>
        );
      } else {
        // Regular paragraph text
        currentItems.push(<p key={currentItems.length}>{cleanedLine}</p>);
      }
    }
    flushSection();

    return elements.length > 0 ? elements : <p className="text-sm text-slate-300 whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="detail-card" style={{ marginTop: "32px", marginBottom: "32px" }}>
      {/* SECTION 1: GENERATE AI THROUGH TEXT */}
      <div
        style={{
          border: "1.5px solid rgba(200, 168, 75, 0.25)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(200, 168, 75, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2V4zM3 7a2 2 0 012-2h.75C5.992 5 6 5.448 6 6v12c0 .552-.008 1-.25 1H5a2 2 0 01-2-2V7z" />
          </svg>
          <h3 className="detail-card-label" style={{ marginBottom: "0" }}>Generate AI through Text</h3>
        </div>
        <p className="text-xs text-slate-400" style={{ marginBottom: "16px", lineHeight: "1.6" }}>
          Enter case information, facts, or relevant details here. AI will analyze the text and generate structured legal insights.
        </p>

        <textarea
          value={caseText}
          onChange={(e) => setCaseText(e.target.value)}
          placeholder="Enter case background, incident details, statements, dates, facts, arguments, or any relevant information for AI analysis..."
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "12px",
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "6px",
            border: "1.5px solid rgba(200, 168, 75, 0.2)",
            color: "#e2e8f0",
            fontSize: "12px",
            fontFamily: "Rajdhani, monospace",
            lineHeight: "1.6",
            resize: "vertical",
            transition: "all 0.2s ease",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200, 168, 75, 0.4)";
            e.target.style.boxShadow = "inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 10px rgba(200, 168, 75, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(200, 168, 75, 0.2)";
            e.target.style.boxShadow = "inset 0 1px 3px rgba(0, 0, 0, 0.2)";
          }}
        />
        <div style={{ marginTop: "8px", fontSize: "10px", color: "#64748b", textAlign: "right" }}>
          {caseText.length} characters
        </div>
      </div>

      {/* SECTION 2: SELECT DOCUMENTS FOR AI ANALYSIS */}
      <div
        style={{
          border: "1.5px solid rgba(200, 168, 75, 0.25)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(200, 168, 75, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h3 className="detail-card-label" style={{ marginBottom: "0" }}>Select Documents for AI Analysis</h3>
        </div>
        <p className="text-xs text-slate-400" style={{ marginBottom: "16px", lineHeight: "1.6" }}>
          Choose one or more case documents. AI will analyze the content and generate structured legal insights including case summary, key points, timeline, and recommendations.
        </p>

        {documents.length > 0 ? (
          <div style={{ padding: "12px", background: "linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.04) 100%)", borderRadius: "6px", border: "1.5px solid rgba(200, 168, 75, 0.2)", boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)" }}>
            <label className="text-xs text-slate-300" style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px" }}>
              📄 DOCUMENTS ({selectedDocuments.length}/{documents.length})
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
              {documents.map((doc) => (
                <label key={doc.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px 8px", background: "rgba(0, 0, 0, 0.15)", borderRadius: "4px", transition: "all 0.2s ease", border: "1px solid rgba(200, 168, 75, 0.1)", fontSize: "12px", color: "#cbd5e1" }}>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => toggleDocument(doc.id)}
                    style={{ width: "14px", height: "14px", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span title={doc.document_name} style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{doc.document_name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
            <p className="text-sm">No documents uploaded yet. You can still generate AI insights using the text input above.</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg className="w-4.5 h-4.5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h2 className="detail-card-label" style={{ marginBottom: 0 }}>AI Legal Analysis</h2>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "11px", color: "var(--muted)" }}>
          {caseText.length > 0 && <span style={{ color: "var(--gold)", fontWeight: 600 }}>📝 Text entered ({caseText.length} chars)</span>}
          {selectedDocuments.length > 0 && <span style={{ color: "var(--gold)", fontWeight: 600 }}>📄 {selectedDocuments.length} doc{selectedDocuments.length !== 1 ? 's' : ''} selected</span>}
        </div>
      </div>

      <button
        onClick={generateInsights}
        disabled={generating}
        className={`detail-btn-ghost ${generating ? "opacity-60 cursor-not-allowed" : ""}`}
        style={{
          height: "40px",
          padding: "0 16px",
          color: generating ? "var(--muted)" : "var(--gold)",
          background: generating ? "var(--gold-dim)" : "linear-gradient(135deg, rgba(200, 168, 75, 0.15) 0%, rgba(200, 168, 75, 0.08) 100%)",
          border: `1.5px solid ${generating ? "rgba(200, 168, 75, 0.2)" : "rgba(200, 168, 75, 0.35)"}`,
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "1px",
          cursor: generating ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: generating ? "none" : "0 4px 12px rgba(200, 168, 75, 0.1)",
        }}
        onMouseEnter={(e) => {
          if (!generating) {
            e.target.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.25) 0%, rgba(200, 168, 75, 0.15) 100%)";
            e.target.style.borderColor = "rgba(200, 168, 75, 0.5)";
            e.target.style.boxShadow = "0 6px 20px rgba(200, 168, 75, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!generating) {
            e.target.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.15) 0%, rgba(200, 168, 75, 0.08) 100%)";
            e.target.style.borderColor = "rgba(200, 168, 75, 0.35)";
            e.target.style.boxShadow = "0 4px 12px rgba(200, 168, 75, 0.1)";
          }
        }}
      >
        {generating ? (
          <>
            <div style={{ display: "inline-block", marginRight: "8px" }} className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-500 border-t-transparent"></div>
            ANALYZING...
          </>
        ) : (
          <>
            <svg style={{ display: "inline-block", marginRight: "8px" }} className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            GENERATE AI INSIGHTS
          </>
        )}
      </button>

      {!loading && notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <svg className="mx-auto w-5 h-5 text-gold/40 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-slate-400 text-sm">No AI analysis generated yet.</p>
        </div>
      )}

      {/* Notes list */}
      {!loading && notes.length > 0 && (
        <div className="space-y-3" style={{ marginTop: "24px" }}>
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
