import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Hearings() {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Form state
  const [form, setForm] = useState({
    case_id: "", hearing_date: "", hearing_time: "", court_name: "",
    judge_name: "", stage: "", notes: "", next_hearing_date: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const stageOptions = ["Filing", "Evidence", "Argument", "Judgment", "Cross-Examination", "Mediation", "Other"];

  useEffect(() => {
    fetchHearings();
    fetchCases();
  }, []);

  const fetchHearings = async () => {
    try {
      const res = await API.get("/hearings/all");
      setHearings(res.data);
    } catch (error) {
      console.error("Error fetching hearings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await API.get("/cases/all");
      setCases(res.data);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.case_id || !form.hearing_date) {
      toast.error("Case and hearing date are required");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/hearings/add", form);
      toast.success("Hearing added successfully!");
      setForm({ case_id: "", hearing_date: "", hearing_time: "", court_name: "", judge_name: "", stage: "", notes: "", next_hearing_date: "" });
      setShowModal(false);
      fetchHearings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add hearing");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHearing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hearing?")) return;
    try {
      await API.delete(`/hearings/${id}`);
      toast.success("Hearing deleted");
      fetchHearings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hearing");
    }
  };

  const statusBadge = (status) => {
    const styles = {
      Scheduled: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      Completed: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      Cancelled: "text-red-400 border-red-500/30 bg-red-500/10",
      Adjourned: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    };
    return styles[status] || styles.Scheduled;
  };

  const filtered = hearings.filter((h) => {
    const matchSearch = search === "" ||
      h.case_title?.toLowerCase().includes(search.toLowerCase()) ||
      h.court_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.judge_name?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter === "" ||
      (h.hearing_date && h.hearing_date.startsWith(dateFilter));
    return matchSearch && matchDate;
  });

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-white/60 text-sm">Loading hearings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide">Hearings</h1>
          <p className="text-white/50 text-sm mt-1">Track all court dates and hearing schedules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gold hover:bg-gold/85 text-primary px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors"
        >
          + Add Hearing
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search case, court, judge..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={`${inputClass} max-w-[180px]`}
        />
        {(search || dateFilter) && (
          <button onClick={() => { setSearch(""); setDateFilter(""); }}
            className="text-xs text-white/50 hover:text-white transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Hearings Table */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-lg border border-gold/10 p-10 text-center">
          <p className="text-white/50 text-sm">No hearings found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">DATE</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">CASE</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">COURT</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">JUDGE</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">STAGE</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">STATUS</th>
                  <th className="text-left p-4 text-[10px] font-bold tracking-[0.2em] text-white/50">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="border-b border-gold/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-white">
                        {new Date(h.hearing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      {h.hearing_time && (
                        <p className="text-[10px] text-white/40 mt-0.5">{h.hearing_time.slice(0, 5)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <Link to={`/cases/${h.case_id}`} className="font-semibold text-gold hover:text-gold/80 transition-colors">
                        {h.case_title}
                      </Link>
                      {h.case_number && <p className="text-[10px] text-white/40 mt-0.5">{h.case_number}</p>}
                    </td>
                    <td className="p-4 text-white/70">{h.court_name || h.court_hall || "—"}</td>
                    <td className="p-4 text-white/70">{h.judge_name || "—"}</td>
                    <td className="p-4 text-white/70">{h.stage || "—"}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border ${statusBadge(h.status)}`}>
                        {h.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/hearings/${h.id}`}
                          className="text-[10px] font-bold tracking-wider text-gold hover:text-gold/80 transition-colors">
                          VIEW
                        </Link>
                        <button onClick={() => deleteHearing(h.id)}
                          className="text-[10px] font-bold tracking-wider text-red-400 hover:text-red-300 transition-colors">
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Hearing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gold/10 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Hearing</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">CASE *</label>
                <select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                  className={inputClass} required>
                  <option value="">Select Case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">HEARING DATE *</label>
                  <input type="date" value={form.hearing_date} onChange={(e) => setForm({ ...form, hearing_date: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">TIME</label>
                  <input type="time" value={form.hearing_time} onChange={(e) => setForm({ ...form, hearing_time: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">COURT NAME</label>
                <input type="text" value={form.court_name} onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                  placeholder="e.g., District Court" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">JUDGE NAME</label>
                <input type="text" value={form.judge_name} onChange={(e) => setForm({ ...form, judge_name: e.target.value })}
                  placeholder="e.g., Justice Sharma" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">STAGE</label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
                  <option value="">Select Stage</option>
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NOTES</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Brief note about the hearing..." rows="3" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NEXT HEARING DATE</label>
                <input type="date" value={form.next_hearing_date} onChange={(e) => setForm({ ...form, next_hearing_date: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                    submitting ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
                  }`}>
                  {submitting ? "ADDING..." : "ADD HEARING"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded font-bold text-sm tracking-wider border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
