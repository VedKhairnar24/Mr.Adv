import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await API.get('/clients/all');
      setClients(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('advocate');
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to load clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      await API.post('/clients/create', formData);
      toast.success('Client added successfully');
      setFormData({ name: '', phone: '', email: '', address: '' });
      setShowAddForm(false);
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated cases.')) return;
    try {
      await API.delete(`/clients/${id}`);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your clients ({clients.length})</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors ${
            showAddForm
              ? 'border border-slate-600 text-slate-400 hover:border-slate-400'
              : 'bg-gold text-primary hover:bg-gold/85'
          }`}
        >
          {showAddForm ? 'CANCEL' : '+ ADD CLIENT'}
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 mb-8">
          <h2 className="text-base font-bold mb-5 text-white tracking-wide">Add New Client</h2>
          <form onSubmit={handleAddClient}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">NAME *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter client name"
                  className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm" required />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">PHONE *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number"
                  className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm" required />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">EMAIL</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">ADDRESS</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter address"
                  className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" className="bg-gold hover:bg-gold/85 text-primary px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                ADD CLIENT
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}
                className="border border-slate-600 text-slate-400 hover:border-slate-400 px-6 py-2 rounded font-bold text-sm tracking-wider transition-colors">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-gold/10 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold/30 text-white placeholder-slate-600 text-sm" />
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="bg-card rounded-lg border border-gold/10 p-12 text-center">
          <p className="text-slate-500">No clients yet. Click "Add Client" to create your first client.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((client) => (
            <div key={client.id} className="bg-card rounded-lg border border-gold/10 p-4 hover:border-gold/25 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">
                    {client.id}. {client.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    <p className="text-xs text-slate-400">📞 {client.phone}</p>
                    {client.email && <p className="text-xs text-slate-400">✉️ {client.email}</p>}
                    {client.address && <p className="text-xs text-slate-400">📍 {client.address}</p>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/clients/${client.id}`}
                    className="text-gold hover:text-gold/80 font-bold text-xs tracking-wider px-3 py-1.5 border border-gold/30 rounded hover:bg-gold/10 transition-colors">
                    VIEW
                  </Link>
                  <button onClick={() => handleDeleteClient(client.id)}
                    className="text-red-400 hover:text-red-300 font-bold text-xs tracking-wider px-3 py-1.5 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors">
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Clients;
