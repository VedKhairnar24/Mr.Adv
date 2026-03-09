import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchClient();
    fetchCases();
  }, []);

  const fetchClient = async () => {
    try {
      const res = await API.get(`/clients/${id}`);
      setClient(res.data);
      setFormData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
        address: res.data.address || "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("advocate");
        toast.error("Please login again");
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast.error("Client not found");
        navigate("/clients");
      } else {
        toast.error("Failed to load client");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await API.get(`/cases/client/${id}`);
      setCases(res.data);
    } catch (error) {
      console.error("Failed to load client cases:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      await API.put(`/clients/${id}`, formData);
      toast.success("Client updated successfully");
      setEditing(false);
      fetchClient();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update client");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this client? This will also delete all associated cases, hearings, and documents.")) return;
    try {
      await API.delete(`/clients/${id}`);
      toast.success("Client deleted successfully");
      navigate("/clients");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete client");
    }
  };

  const statusColors = {
    Active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    Pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    Closed: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    "On Hold": "text-orange-400 border-orange-500/30 bg-orange-500/10",
    Disposed: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Client not found.</p>
        <Link to="/clients" className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider">
          ← BACK TO CLIENTS
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/clients" className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider mb-3 inline-block">
            ← BACK TO CLIENTS
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Client Details</h1>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)}
                className="bg-gold hover:bg-gold/85 text-primary px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                EDIT
              </button>
              <button onClick={handleDelete}
                className="text-red-400 border border-red-500/30 hover:bg-red-500/10 px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                DELETE
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing ? (
        <div className="bg-card rounded-lg border border-gold/10 p-6">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">EDIT CLIENT</h2>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">NAME *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">PHONE *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">EMAIL</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">ADDRESS</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="submit"
                className="bg-gold hover:bg-gold/85 text-primary px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                SAVE CHANGES
              </button>
              <button type="button"
                onClick={() => { setEditing(false); setFormData({ name: client.name || "", phone: client.phone || "", email: client.email || "", address: client.address || "" }); }}
                className="border border-slate-600 text-slate-400 hover:border-slate-400 px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Client Details View */
        <div className="bg-card rounded-lg border border-gold/10 p-6">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CLIENT INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CLIENT ID</p>
              <p className="font-semibold text-white text-sm">{client.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">NAME</p>
              <p className="font-semibold text-white text-sm">{client.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">PHONE</p>
              <p className="font-semibold text-white text-sm">{client.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">EMAIL</p>
              <p className="font-semibold text-white text-sm">{client.email || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">ADDRESS</p>
              <p className="font-semibold text-white text-sm">{client.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CREATED</p>
              <p className="font-semibold text-white text-sm">{client.created_at ? new Date(client.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Client Cases Section */}
      {!editing && (
        <div className="mt-8">
          <h2 className="text-sm font-bold mb-4 text-white tracking-wide">CLIENT CASES</h2>
          {cases.length === 0 ? (
            <div className="bg-card rounded-lg border border-gold/10 p-8 text-center">
              <p className="text-slate-500 text-sm">No cases found for this client.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => (
                <div key={c.id} className="bg-card border border-gold/10 rounded-lg p-4 hover:border-gold/25 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white text-sm">{c.case_title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500">
                        Case No: {c.case_number || "N/A"}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${statusColors[c.status] || "text-blue-400 border-blue-500/30 bg-blue-500/10"}`}>
                        {c.status}
                      </span>
                      {c.court_name && (
                        <span className="text-[10px] text-slate-500">Court: {c.court_name}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/cases/${c.id}`}
                    className="text-gold text-xs font-bold tracking-wider px-4 py-2 border border-gold/30 rounded hover:bg-gold/10 transition-colors">
                    VIEW
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
