import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AddHearing({ caseId }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [court, setCourt] = useState("");
  const [judge, setJudge] = useState("");
  const [stage, setStage] = useState("");
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [adding, setAdding] = useState(false);

  const stageOptions = ["Filing", "Evidence", "Argument", "Judgment", "Cross-Examination", "Mediation", "Other"];
  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  const addHearing = async (e) => {
    e.preventDefault();
    if (!date || !court) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      setAdding(true);
      await API.post("/hearings/add", {
        case_id: caseId,
        hearing_date: date,
        hearing_time: time || undefined,
        court_name: court,
        judge_name: judge || undefined,
        stage: stage || undefined,
        notes: note || undefined,
        next_hearing_date: nextDate || undefined,
      });
      toast.success("Hearing added successfully!");
      setDate(""); setTime(""); setCourt(""); setJudge(""); setStage(""); setNote(""); setNextDate("");
      window.dispatchEvent(new CustomEvent('hearingAdded'));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add hearing");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={addHearing} className="bg-card border border-gold/10 p-5 rounded-lg mt-6">
      <h2 className="text-sm font-bold mb-4 text-white tracking-wide">ADD HEARING</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">HEARING DATE *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">TIME</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">COURT NAME *</label>
          <input type="text" value={court} onChange={(e) => setCourt(e.target.value)}
            placeholder="e.g., District Court" className={inputClass} required />
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">JUDGE NAME</label>
          <input type="text" value={judge} onChange={(e) => setJudge(e.target.value)}
            placeholder="e.g., Justice Sharma" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">STAGE</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputClass}>
            <option value="">Select Stage</option>
            {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">NEXT HEARING DATE</label>
          <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">NOTES</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Brief note about the hearing..." rows="3" className={inputClass} />
      </div>

      <button type="submit" disabled={adding}
        className={`px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors ${
          adding ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
        }`}>
        {adding ? "ADDING..." : "ADD HEARING"}
      </button>
    </form>
  );
}
