import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    if (
      !window.confirm(
        "Delete this client? This will also delete all associated cases, hearings, and documents."
      )
    )
      return;

    try {
      await API.delete(`/clients/${id}`);
      toast.success("Client deleted successfully");
      navigate("/clients");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete client");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Client not found.</p>
        <Link to="/clients" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            to="/clients"
            className="text-blue-600 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Client Details</h1>
        </div>

        <div className="flex gap-3">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Client</h2>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: client.name || "",
                    phone: client.phone || "",
                    email: client.email || "",
                    address: client.address || "",
                  });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Client Details View */
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Client ID</p>
                <p className="text-lg font-medium text-gray-900">{client.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {client.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-lg font-medium text-gray-900">
                  {client.phone || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">
                  {client.email || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg font-medium text-gray-900">
                  {client.address || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-lg font-medium text-gray-900">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
