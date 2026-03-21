import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function QuillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 3c-6 1-10 4.2-13.5 10.5L5 19l5.5-1.5C16.8 14 20 10 21 4l-1-1z" />
      <path d="M7 17 4 20M14 8l2 2" />
    </svg>
  );
}

function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes");
      setNotes(res.data || []);
    } catch (err) {
      toast.error("Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const mapType = (apiType = "") => {
    const t = apiType.toLowerCase();
    if (t.includes("strategy")) return "Strategy";
    if (t.includes("reminder") || t.includes("task")) return "Reminder";
    if (t.includes("client")) return "Client Instruction";
    return "General";
  };

  const typeTheme = (mappedType) => {
    switch (mappedType) {
      case "Strategy":
        return { border: "var(--gold)", badge: "badge-scheduled" };
      case "Reminder":
        return { border: "#fbbf24", badge: "badge-pending" };
      case "Client Instruction":
        return { border: "#60a5fa", badge: "note-badge-client" };
      default:
        return { border: "#9ca3af", badge: "badge-disposed" };
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const mapped = mapType(note.note_type);
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        (note.title || "").toLowerCase().includes(q) ||
        (note.content || "").toLowerCase().includes(q) ||
        (note.case_title || "").toLowerCase().includes(q) ||
        (note.case_number || "").toLowerCase().includes(q);
      const matchType = filterType === "All Types" || mapped === filterType;
      return matchSearch && matchType;
    });
  }, [notes, search, filterType]);

  const displayNotes = filteredNotes;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <style>{`
        .notes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
        .note-content-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .note-badge-client {
          background: var(--info-dim);
          color: #60a5fa;
          border-color: rgba(96,165,250,0.35);
        }
        @media (max-width: 1024px) {
          .notes-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .notes-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Notes</h1>
          <p className="app-header-subtitle">Manage your legal notes ({notes.length})</p>
        </div>
        <Link to="/notes/create" className="btn-primary" style={{ alignItems: "center", fontWeight: 700, display: "flex" }}>+ New Note</Link>
      </header>

      <div className="app-body">
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span className="search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search notes by title, content, or case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--white)", fontFamily: "Rajdhani, sans-serif", fontSize: "14px" }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--muted)", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", fontWeight: 500, height: "48px", padding: "0 40px 0 14px", minWidth: "190px" }}
          >
            <option>All Types</option>
            <option>Strategy</option>
            <option>Reminder</option>
            <option>Client Instruction</option>
            <option>General</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state" style={{ minHeight: "260px" }}>
            <div className="inline-block animate-spin rounded-full h-8 w-8" style={{ border: "2px solid var(--gold)", borderTopColor: "transparent" }}></div>
          </div>
        ) : displayNotes.length > 0 ? (
          <div className="notes-grid">
            {displayNotes.map((note) => {
              const mappedType = mapType(note.note_type);
              const theme = typeTheme(mappedType);
              const caseTag = note.case_number || "General";
              const dateText = new Date(note.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              return (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  style={{
                    
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderLeft: `4px solid ${theme.border}`,
                    borderRadius: "3px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                    width: "100%",
                    display: "block",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "rgba(200,168,75,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px", minHeight: "32px" }}>
                    <h3 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "15px", fontWeight: 600, lineHeight: 1.4, color: "var(--white)", paddingRight: "8px", flex: 1 }}>
                      {note.title}
                    </h3>
                    <span className={`badge ${theme.badge}`}>{mappedType}</span>
                  </div>

                  <p className="note-content-clamp" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", lineHeight: 1.65, color: "var(--muted)", marginBottom: "16px" }}>
                    {note.content || "No preview available"}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap", minHeight: "28px" }}>
                    <span style={{ height: "24px", display: "inline-flex", alignItems: "center", background: "var(--gold-dim)", border: "1px solid rgba(200,168,75,0.35)", color: "var(--gold)", fontFamily: "Rajdhani, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "0 10px", borderRadius: "2px" }}>
                      {caseTag}
                    </span>
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "10px", fontWeight: 500, color: "var(--muted2)" }}>
                      {dateText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ minHeight: "300px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", marginBottom: "12px" }}>
              <span style={{ width: "20px", height: "20px" }}><QuillIcon /></span>
            </div>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "18px", color: "var(--white)" }}>
              Your legal notes will appear here
            </p>
            <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
              Begin by creating your first note
            </p>
            <Link to="/notes/create" className="btn-primary" style={{ alignItems: "center", fontWeight: 700, display: "flex" }}>Create Note</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
