import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const NOTE_TYPES = ["Client Meeting", "Court Observation", "Legal Research", "Strategy Note", "Task", "General"];

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterType) params.note_type = filterType;
      const res = await API.get("/notes", { params });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete note");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filterType]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Notes</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your legal notes ({notes.length})</p>
        </div>
        <Link
          to="/notes/create"
          className="bg-gold text-primary hover:bg-gold/85 px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors"
        >
          + NEW NOTE
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-card rounded-lg border border-gold/10 p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Search notes by title, content, or case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-primary border border-gold/15 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/30 text-white placeholder-slate-600 text-sm"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-primary border border-gold/15 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/30 text-white text-sm"
          >
            <option value="">All Types</option>
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-gold hover:bg-gold/85 text-primary px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
            <p className="mt-3 text-slate-400 text-sm">Loading notes...</p>
          </div>
        </div>
      )}

      {/* Notes Table */}
      {!loading && notes.length > 0 && (
        <div className="bg-card rounded-lg border border-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10">
              <thead className="bg-primary/50">
                <tr>
                  {["Title", "Case", "Type", "Author", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-primary/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-white">{note.title}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {note.case_title || <span className="text-slate-600 italic">No case</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${getTypeStyle(note.note_type)}`}>
                        {note.note_type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{note.author || "Advocate"}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">
                      <Link to={`/notes/${note.id}`} className="text-gold hover:text-gold/80 mr-3 font-semibold text-xs tracking-wider">VIEW</Link>
                      <Link to={`/notes/${note.id}/edit`} className="text-blue-400 hover:text-blue-300 mr-3 font-semibold text-xs tracking-wider">EDIT</Link>
                      <button onClick={() => deleteNote(note.id)} className="text-red-400 hover:text-red-300 font-semibold text-xs tracking-wider">DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <div className="bg-card rounded-lg border border-gold/10 p-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-bold text-white mt-4 mb-2">No notes found</h3>
          <p className="text-slate-500 text-sm mb-6">Get started by creating your first note</p>
          <Link
            to="/notes/create"
            className="bg-gold hover:bg-gold/85 text-primary px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors"
          >
            CREATE NOTE
          </Link>
        </div>
      )}
    </div>
  );
}

export default Notes;
