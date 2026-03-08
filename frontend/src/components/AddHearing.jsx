import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AddHearing({ caseId }) {
  const [date, setDate] = useState("");
  const [court, setCourt] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

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
        court_hall: court,
        notes: note,
      });

      toast.success("Hearing added successfully!");
      setDate("");
      setCourt("");
      setNote("");
      
      // Trigger refresh of hearing list
      window.dispatchEvent(new CustomEvent('hearingAdded'));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add hearing");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={addHearing} className="border p-4 rounded-lg mt-6 bg-gray-50">
      <h2 className="font-bold text-lg mb-3 text-gray-900">Add Hearing</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hearing Date *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Court Name *
        </label>
        <input
          type="text"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          placeholder="e.g., District Court, High Court"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Brief note about the hearing..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={adding}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          adding
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {adding ? "Adding..." : "Add Hearing"}
      </button>
    </form>
  );
}
