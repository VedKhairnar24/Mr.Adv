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
    <form onSubmit={addHearing} className="detail-card" style={{ padding: "24px" }}>
      <div className="detail-card-label">Add Hearing</div>

      <div style={{ display: "grid", gap: "16px" }}>
        <div className="detail-field">
          <label className="detail-field-label">Hearing Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="detail-input" required />
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="detail-input" />
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Court Name *</label>
          <input
            type="text"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            placeholder="e.g., District Court"
            className="detail-input"
            required
          />
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Judge Name</label>
          <input
            type="text"
            value={judge}
            onChange={(e) => setJudge(e.target.value)}
            placeholder="e.g., Justice Sharma"
            className="detail-input"
          />
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="detail-select">
            <option value="">Select Stage</option>
            {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Next Hearing Date</label>
          <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="detail-input" />
        </div>

        <div className="detail-field">
          <label className="detail-field-label">Notes</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Brief note about the hearing..."
            className="detail-textarea"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={adding}
        className={`btn-primary ${adding ? "opacity-60 cursor-not-allowed" : ""}`}
        style={{ width: "100%", marginTop: "14px", height: "44px", minHeight: "44px" }}
      >
        {adding ? "Adding..." : "Add Hearing"}
      </button>
    </form>
  );
}
