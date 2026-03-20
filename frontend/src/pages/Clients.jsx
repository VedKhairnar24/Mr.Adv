import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2L8 9.5a16 16 0 0 0 6.5 6.5l1.1-1.1a2 2 0 0 1 2-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 10v6M14 10v6" />
    </svg>
  );
}

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
          <p className="mt-3" style={{ color: 'var(--muted)', fontFamily: 'Rajdhani, sans-serif', fontSize: '12px' }}>
            Loading clients...
          </p>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* SECTION A: HEADER BAR */}
      <header
        style={{
          padding: '28px 40px 20px',
          borderBottom: '1px solid rgba(180, 150, 80, 0.08)',
          background: 'rgba(10, 18, 16, 0.5)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--white)'
            }}
          >
            Clients
          </h1>
          <p
            style={{
              marginTop: '4px',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--muted)'
            }}
          >
            Manage your clients ({clients.length})
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase'
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Client'}
        </button>
      </header>

      <div style={{ padding: '32px 40px' }}>
        {/* Add Client Form */}
        {showAddForm && (
          <div className="card" style={{ padding: '24px', borderRadius: '3px', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 600, color: 'var(--white)', marginBottom: '16px' }}>
              Add New Client
            </h2>
            <form onSubmit={handleAddClient}>
              <div className="grid grid-2 gap-md">
                <div>
                  <label className="label text-gold mb-sm" style={{ display: 'block' }}>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter client name" required />
                </div>
                <div>
                  <label className="label text-gold mb-sm" style={{ display: 'block' }}>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
                </div>
                <div>
                  <label className="label text-gold mb-sm" style={{ display: 'block' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" />
                </div>
                <div>
                  <label className="label text-gold mb-sm" style={{ display: 'block' }}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter address" />
                </div>
              </div>
              <div className="mt-lg flex gap-md">
                <button type="submit" className="btn-primary">Add Client</button>
                <button type="button" className="btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION B: SEARCH BAR */}
        <div style={{ width: '100%', marginBottom: '20px', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              color: 'var(--white)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              padding: '12px 16px 12px 44px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(200, 168, 75, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
            }}
          />
        </div>

        {/* SECTION C: CLIENT CARDS LIST */}
        {filteredClients.length === 0 ? (
          <div className="empty-state" style={{ minHeight: '280px' }}>
            <div className="empty-icon" style={{ width: '48px', height: '48px', fontSize: '20px' }}>👥</div>
            <h3 className="empty-title" style={{ fontSize: '18px' }}>No clients found</h3>
            <p className="empty-text" style={{ fontSize: '12px' }}>Try a different search or add a new client.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredClients.map((client) => (
              <article
                key={client.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid transparent',
                  borderRadius: '3px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = 'var(--gold)';
                  e.currentTarget.style.background = 'var(--surface2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.background = 'var(--surface)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    border: '1.5px solid var(--gold2)',
                    color: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '20px',
                    fontWeight: 700
                  }}
                >
                  {(client.name?.charAt(0) || 'C').toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--white)',
                      marginBottom: '5px'
                    }}
                  >
                    {client.name}
                  </h3>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--muted)' }}>
                      <span style={{ width: '13px', height: '13px' }}><PhoneIcon /></span>
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', fontWeight: 400 }}>{client.phone}</span>
                    </span>

                    {client.email && (
                      <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--muted)' }}>
                        <span style={{ width: '13px', height: '13px' }}><MailIcon /></span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', fontWeight: 400 }}>{client.email}</span>
                      </span>
                    )}

                    {client.address && (
                      <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--muted)' }}>
                        <span style={{ width: '13px', height: '13px' }}><PinIcon /></span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', fontWeight: 400 }}>{client.address}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to={`/clients/${client.id}`}
                    className="btn-ghost"
                    style={{
                      borderColor: 'rgba(200, 168, 75, 0.35)',
                      color: 'var(--gold)',
                      fontSize: '11px',
                      padding: '8px 12px',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '14px', height: '14px' }}><EyeIcon /></span>
                    View
                  </Link>

                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="btn-danger"
                    style={{ padding: '10px' }}
                    title="Delete client"
                  >
                    <span style={{ width: '14px', height: '14px' }}><TrashIcon /></span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;
