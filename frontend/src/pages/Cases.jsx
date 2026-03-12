import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    case_title: "",
    case_number: "",
    court_name: "",
    case_type: "",
    filing_date: ""
  });

  const navigate = useNavigate();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createCase = async (e) => {
    e.preventDefault();
    try {
      await API.post("/cases/create", formData);
      alert("Case created successfully!");
      setFormData({ client_id: "", case_title: "", case_number: "", court_name: "", case_type: "", filing_date: "" });
      setShowForm(false);
      fetchCases();
    } catch (err) {
      console.error("Error creating case:", err);
      alert(err.response?.data?.message || "Failed to create case");
    }
  };

  const deleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      await API.delete(`/cases/${id}`);
      alert("Case deleted successfully!");
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete case");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/cases/${id}/status`, { status });
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "Pending":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "On Hold":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "Closed":
      case "Disposed":
        return "text-slate-400 border-slate-500/30 bg-slate-500/10";
      default:
        return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const inputClass = "w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm";

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Cases</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your legal cases</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors border border-slate-600 text-slate-400 hover:border-slate-400  ${
            showForm
              ? 'border border-slate-600 text-slate-400 hover:border-slate-400'
              : 'bg-gold text-primary hover:bg-gold/85'
          }`}
        >
          {showForm ? "CANCEL" : "+ NEW CASE"}
        </button>
      </div>

      {/* Create Case Form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 mb-8">
          <h2 className="text-base font-bold mb-5 text-white tracking-wide">Create New Case</h2>
          <form onSubmit={createCase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CLIENT ID *</label>
                <input type="number" name="client_id" value={formData.client_id} onChange={handleInputChange} placeholder="Enter client ID" required className={inputClass} />
                <p className="text-[10px] text-slate-600 mt-1">Note: Create clients first in the Clients page</p>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE TITLE *</label>
                <input type="text" name="case_title" value={formData.case_title} onChange={handleInputChange} placeholder="e.g., Smith v. Johnson" required className={inputClass} />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE NUMBER</label>
                <input type="text" name="case_number" value={formData.case_number} onChange={handleInputChange} placeholder="e.g., CV-2024-001" className={inputClass} />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">COURT NAME *</label>
                <input type="text" name="court_name" value={formData.court_name} onChange={handleInputChange} placeholder="e.g., High Court of Delhi" required className={inputClass} />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">CASE TYPE</label>
                <select name="case_type" value={formData.case_type} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Type</option>
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Family">Family</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Property">Property</option>
                  <option value="Labor">Labor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">FILING DATE</label>
                <input type="date" name="filing_date" value={formData.filing_date} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-gold hover:bg-gold/85 text-primary px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">CREATE CASE</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-slate-600 text-slate-400 hover:border-slate-400 px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">CANCEL</button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-sm">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
            <p className="mt-3 text-slate-400 text-sm">Loading cases...</p>
          </div>
        </div>
      )}

      {/* Cases Table */}
      {!loading && cases.length > 0 && (
        <div className="bg-card rounded-lg border border-gold/10 overflow-hidden">
          {/* Search */}
          <div className="px-5 py-4 border-b border-gold/10">
            <input type="text" placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/30 text-white placeholder-slate-600 text-sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10">
              <thead className="bg-primary/50">
                <tr>
                  {["Case Title", "Client", "Case #", "Court", "Type", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {cases
                  .filter((c) => c.case_title.toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-primary/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-white">{c.case_title}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{c.client_name || "N/A"}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{c.case_number || "-"}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{c.court_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{c.case_type || "-"}</td>
                    <td className="px-5 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id || c.id, e.target.value)}
                        className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border cursor-pointer focus:outline-none ${getStatusStyle(c.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Closed">Closed</option>
                        <option value="Disposed">Disposed</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">
                      <Link to={`/cases/${c._id || c.id}`} className="text-gold hover:text-gold/80 mr-3 font-semibold text-xs tracking-wider">VIEW</Link>
                      <button onClick={() => deleteCase(c._id || c.id)} className="text-red-400 hover:text-red-300 font-semibold text-xs tracking-wider">DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && cases.length === 0 && (
        <div className="bg-card rounded-lg border border-gold/10 p-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-bold text-white mt-4 mb-2">No cases found</h3>
          <p className="text-slate-500 text-sm mb-6">Get started by creating your first case</p>
          <button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold/85 text-primary px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">
            CREATE CASE
          </button>
        </div>
      )}
    </div>
  );
}

export default Cases;
