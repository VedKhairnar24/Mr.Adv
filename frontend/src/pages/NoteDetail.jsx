import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNote = async () => {
    try {
      const res = await API.get(`/notes/${id}`);
      setNote(res.data);
    } catch (err) {
      console.error("Error loading note:", err);
      toast.error("Failed to load note");
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success("Note deleted successfully");
      navigate("/notes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete note");
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  const getTypeStyle = (type) => {
    switch (type) {
      case "Client Meeting": return "text-blue-400 border-blue-500/30 bg-blue-500/10";
      case "Court Observation": return "text-purple-400 border-purple-500/30 bg-purple-500/10";
      case "Legal Research": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "Strategy Note": return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "Task": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      default: return "text-slate-400 border-slate-500/30 bg-slate-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Note not found</p>
        <button onClick={() => navigate("/notes")}
          className="bg-gold hover:bg-gold/85 text-primary px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors">
          BACK TO NOTES
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/notes")}
          className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider mb-3 inline-block">
          ← BACK TO NOTES
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">{note.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${getTypeStyle(note.note_type)}`}>
                {note.note_type}
              </span>
              {note.case_title && (
                <Link to={`/cases/${note.case_id}`} className="text-gold hover:text-gold/80 text-xs font-semibold tracking-wider">
                  📁 {note.case_title}
                </Link>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/notes/${note.id}/edit`}
              className="text-gold text-xs font-bold tracking-wider px-4 py-2 border border-gold/30 rounded hover:bg-gold/10 transition-colors"
            >
              EDIT
            </Link>
            <button
              onClick={deleteNote}
              className="text-red-400 text-xs font-bold tracking-wider px-4 py-2 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
            >
              DELETE
            </button>
          </div>
        </div>
      </div>

      {/* Note Metadata */}
      <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
        <h2 className="text-sm font-bold mb-5 text-white tracking-wide">NOTE INFORMATION</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CASE</p>
            <p className="font-semibold text-white text-sm">
              {note.case_title || <span className="text-slate-500 italic">No case linked</span>}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">TYPE</p>
            <p className="font-semibold text-white text-sm">{note.note_type}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">AUTHOR</p>
            <p className="font-semibold text-white text-sm">{note.author || "Advocate"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CREATED</p>
            <p className="font-semibold text-white text-sm">
              {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="bg-card p-6 rounded-lg border border-gold/10">
        <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CONTENT</h2>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {note.content}
        </div>
      </div>

      {/* Updated timestamp */}
      {note.updated_at && note.updated_at !== note.created_at && (
        <p className="text-slate-600 text-xs mt-4">
          Last updated: {new Date(note.updated_at).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

export default NoteDetail;
