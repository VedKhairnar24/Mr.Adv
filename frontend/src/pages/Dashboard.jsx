import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [advocate, setAdvocate] = useState(null);

  useEffect(() => {
    // Get advocate info from localStorage
    const storedAdvocate = localStorage.getItem('advocate');
    if (storedAdvocate) {
      setAdvocate(JSON.parse(storedAdvocate));
    }

    // Fetch dashboard data, hearings, and counts
    fetchDashboard();
    fetchHearings();
    fetchCounts();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('advocate');
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHearings = async () => {
    try {
      const response = await API.get('/hearings/upcoming');
      setHearings(response.data);
    } catch (error) {
      console.error('Error fetching hearings:', error);
      // Don't show error toast for this, just log it
    }
  };

  const fetchCounts = async () => {
    try {
      const [clientsRes, casesRes] = await Promise.all([
        API.get('/clients/count'),
        API.get('/cases/count')
      ]);
      setClientCount(clientsRes.data.count);
      setCaseCount(casesRes.data.count);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('advocate');
    toast.success('Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {advocate?.name || 'Advocate'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm font-medium">Total Clients</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">{clientCount}</h2>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm font-medium">Total Cases</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">{caseCount}</h2>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm font-medium">Upcoming Hearings</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">{hearings.length}</h2>
          </div>

        </div>

        {/* Upcoming Hearings Section */}
        <div className="bg-white rounded-lg shadow p-6">

          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Upcoming Hearings
          </h2>

          {hearings.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No upcoming hearings
            </p>
          )}

          {hearings.map((h) => (

            <div
              key={h._id || h.id}
              className="border-b py-3 flex justify-between items-center last:border-b-0"
            >

              <div>
                <p className="font-medium text-gray-900">{h.case_title}</p>
                <p className="text-sm text-gray-500">
                  Client: {h.client_name}
                </p>
              </div>

              <div className="text-sm text-gray-600 font-medium">
                {new Date(h.hearing_date).toLocaleDateString('en-IN')}
              </div>

            </div>

          ))}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
