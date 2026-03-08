import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(""); // Search state
  
  // Form state
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

  // Fetch all cases
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new case
  const createCase = async (e) => {
    e.preventDefault();
    
    try {
      await API.post("/cases/create", formData);
      alert("Case created successfully!");
      setFormData({
        client_id: "",
        case_title: "",
        case_number: "",
        court_name: "",
        case_type: "",
        filing_date: ""
      });
      setShowForm(false);
      fetchCases();
    } catch (err) {
      console.error("Error creating case:", err);
      alert(err.response?.data?.message || "Failed to create case");
    }
  };

  // Delete case
  const deleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) {
      return;
    }

    try {
      await API.delete(`/cases/${id}`);
      alert("Case deleted successfully!");
      fetchCases();
    } catch (err) {
      console.error("Error deleting case:", err);
      alert(err.response?.data?.message || "Failed to delete case");
    }
  };

  // Update case status
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/cases/${id}/status`, { status });
      fetchCases();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "On Hold":
        return "bg-orange-100 text-orange-800";
      case "Closed":
      case "Disposed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600 mt-1">Manage your legal cases</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {showForm ? "Cancel" : "+ New Case"}
        </button>
      </div>

      {/* Create Case Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Case</h2>
          
          <form onSubmit={createCase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client ID - Should be dropdown in production */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID *
                </label>
                <input
                  type="number"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  placeholder="Enter client ID"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Create clients first in the Clients page
                </p>
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  name="case_title"
                  value={formData.case_title}
                  onChange={handleInputChange}
                  placeholder="e.g., Smith v. Johnson"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Case Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Number
                </label>
                <input
                  type="text"
                  name="case_number"
                  value={formData.case_number}
                  onChange={handleInputChange}
                  placeholder="e.g., CV-2024-001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Court Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court Name *
                </label>
                <input
                  type="text"
                  name="court_name"
                  value={formData.court_name}
                  onChange={handleInputChange}
                  placeholder="e.g., High Court of Delhi"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Case Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Type
                </label>
                <select
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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

              {/* Filing Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filing Date
                </label>
                <input
                  type="date"
                  name="filing_date"
                  value={formData.filing_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Case
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading cases...</p>
        </div>
      )}

      {/* Cases List */}
      {!loading && cases.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cases
            </h1>
            <p className="text-sm text-gray-500">
              Manage your legal cases ({cases.length})
            </p>
            
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Court
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases
                  .filter((c) =>
                    c.case_title.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{c.case_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{c.client_name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{c.case_number || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{c.court_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{c.case_type || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id || c.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Closed">Closed</option>
                        <option value="Disposed">Disposed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/cases/${c._id || c.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteCase(c._id || c.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first case</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Case
          </button>
        </div>
      )}
    </div>
  );
}

export default Cases;
