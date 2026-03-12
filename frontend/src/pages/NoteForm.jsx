import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const NOTE_TYPES = ["Client Meeting", "Court Observation", "Legal Research", "Strategy Note", "Task", "General"];

function NoteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    case_id: searchParams.get("case_id") || "",
    note_type: "General",
    title: "",
    content: "",
    author: "Advocate",
  });

  const fetchCases = async () => {
    try {
      const res = await API.get("/cases/all");
      setCases(res.data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const fetchNote = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/notes/${id}`);
      setFormData({
        case_id: res.data.case_id || "",
        note_type: res.data.note_type || "General",
        title: res.data.title || "",
        content: res.data.content || "",
        author: res.data.author || "Advocate",
      });
    } catch (err) {
      console.error("Error fetching note:", err);
      toast.error("Failed to load note");
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    if (isEdit) fetchNote();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        case_id: formData.case_id || null,
      };

      if (isEdit) {
        await API.put(`/notes/${id}`, payload);
        toast.success("Note updated successfully");
      } else {
        await API.post("/notes", payload);
        toast.success("Note created successfully");
      }
      navigate("/notes");
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} note`);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm focus:outline-none";

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/notes")}
          className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider mb-3 inline-block">
          ← BACK TO NOTES
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">
          {isEdit ? "Edit Note" : "Create Note"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isEdit ? "Update your note details" : "Write a new legal note"}
        </p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-lg border border-gold/10 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case Dropdown */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE (OPTIONAL)</label>
              <select name="case_id" value={formData.case_id} onChange={handleChange} className={inputClass}>
                <option value="">No case linked</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.case_title}</option>
                ))}
              </select>
            </div>

            {/* Note Type */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">NOTE TYPE *</label>
              <select name="note_type" value={formData.note_type} onChange={handleChange} className={inputClass} required>
                {NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">TITLE *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Meeting with client regarding property dispute"
              className={inputClass}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CONTENT *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your note content here..."
              rows="10"
              className={inputClass}
              required
            />
          </div>

          {/* Author */}
          <div className="md:w-1/2">
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">AUTHOR</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Advocate"
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors ${
                saving ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
              }`}
            >
              {saving ? "SAVING..." : isEdit ? "UPDATE NOTE" : "SAVE NOTE"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/notes")}
              className="border border-slate-600 text-slate-400 hover:border-slate-400 px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteForm;
