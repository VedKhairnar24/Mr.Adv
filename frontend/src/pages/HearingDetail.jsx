import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function HearingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const stageOptions = ["Filing", "Evidence", "Argument", "Judgment", "Cross-Examination", "Mediation", "Other"];
  const statusOptions = ["Scheduled", "Completed", "Cancelled", "Adjourned"];

  useEffect(() => {
    fetchHearing();
  }, [id]);

  const fetchHearing = async () => {
    try {
      const res = await API.get(`/hearings/detail/${id}`);
      setHearing(res.data);
      setForm(res.data);
    } catch (error) {
      console.error("Error fetching hearing:", error);
      toast.error("Failed to load hearing details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put(`/hearings/${id}`, {
        hearing_date: form.hearing_date,
        hearing_time: form.hearing_time,
        court_name: form.court_name,
        court_hall: form.court_hall,
        judge_name: form.judge_name,
        stage: form.stage,
        notes: form.notes,
        next_hearing_date: form.next_hearing_date,
        status: form.status,
      });
      toast.success("Hearing updated successfully!");
      setEditing(false);
      fetchHearing();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update hearing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hearing?")) return;
    try {
      await API.delete(`/hearings/${id}`);
      toast.success("Hearing deleted");
      navigate("/hearings");
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const formatDateInput = (d) => d ? d.split("T")[0] : "";

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-white/60 text-sm">Loading hearing details...</p>
        </div>
      </div>
    );
  }

  if (!hearing) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 mb-4">Hearing not found</p>
        <button onClick={() => navigate("/hearings")}
          className="bg-gold hover:bg-gold/85 text-primary px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors">
          BACK TO HEARINGS
        </button>
      </div>
    );
  }

  return (
    <div className="text-white max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/hearings")}
          className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider mb-3 inline-block">
          ← BACK TO HEARINGS
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-wide">Hearing Details</h1>
          <span className={`text-[10px] font-bold tracking-wider px-3 py-1.5 rounded border ${statusBadge(hearing.status)}`}>
            {hearing.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {!editing ? (
        /* View Mode */
        <>
          <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
            <h2 className="text-sm font-bold mb-5 text-white tracking-wide">HEARING INFORMATION</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">CASE</p>
                <p className="font-semibold text-gold text-sm">{hearing.case_title}</p>
                {hearing.case_number && <p className="text-[10px] text-white/40 mt-0.5">{hearing.case_number}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">CLIENT</p>
                <p className="font-semibold text-white text-sm">{hearing.client_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">DATE</p>
                <p className="font-semibold text-white text-sm">{formatDate(hearing.hearing_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">TIME</p>
                <p className="font-semibold text-white text-sm">{hearing.hearing_time ? hearing.hearing_time.slice(0, 5) : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">COURT</p>
                <p className="font-semibold text-white text-sm">{hearing.court_name || hearing.court_hall || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white/40 mb-1">JUDGE</p>
                <p className="font-semibold text-white text-sm">{hearing.judge_name || "—"}</p>
              </div>
            </div>
          </div>

          {/* Stage */}
          {hearing.stage && (
            <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
              <h2 className="text-sm font-bold mb-3 text-white tracking-wide">STAGE</h2>
              <p className="text-white/70">{hearing.stage}</p>
            </div>
          )}

          {/* Notes */}
          {hearing.notes && (
            <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
              <h2 className="text-sm font-bold mb-3 text-white tracking-wide">NOTES</h2>
              <p className="text-white/70 text-sm leading-relaxed">{hearing.notes}</p>
            </div>
          )}

          {/* Next Hearing */}
          {hearing.next_hearing_date && (
            <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
              <h2 className="text-sm font-bold mb-3 text-white tracking-wide">NEXT HEARING</h2>
              <p className="text-gold font-semibold">{formatDate(hearing.next_hearing_date)}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)}
              className="bg-gold hover:bg-gold/85 text-primary px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors">
              EDIT
            </button>
            <button onClick={handleDelete}
              className="px-5 py-2.5 rounded font-bold text-sm tracking-wider border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              DELETE
            </button>
          </div>
        </>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleUpdate} className="bg-card p-6 rounded-lg border border-gold/10 space-y-4">
          <h2 className="text-sm font-bold mb-4 text-white tracking-wide">EDIT HEARING</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">HEARING DATE</label>
              <input type="date" value={formatDateInput(form.hearing_date)}
                onChange={(e) => setForm({ ...form, hearing_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">TIME</label>
              <input type="time" value={form.hearing_time || ""}
                onChange={(e) => setForm({ ...form, hearing_time: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">COURT NAME</label>
            <input type="text" value={form.court_name || ""}
              onChange={(e) => setForm({ ...form, court_name: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">JUDGE NAME</label>
            <input type="text" value={form.judge_name || ""}
              onChange={(e) => setForm({ ...form, judge_name: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">STAGE</label>
              <select value={form.stage || ""} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
                <option value="">Select Stage</option>
                {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">STATUS</label>
              <select value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NOTES</label>
            <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NEXT HEARING DATE</label>
            <input type="date" value={formatDateInput(form.next_hearing_date)}
              onChange={(e) => setForm({ ...form, next_hearing_date: e.target.value })} className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                saving ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
              }`}>
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setForm(hearing); }}
              className="px-5 py-2.5 rounded font-bold text-sm tracking-wider border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
              CANCEL
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
