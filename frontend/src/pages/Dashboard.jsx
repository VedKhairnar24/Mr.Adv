import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {

  const [clientCount, setClientCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [hearings, setHearings] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {

    try {

      const res = await API.get("/dashboard");

      setClientCount(res.data.totalClients || 0);
      setCaseCount(res.data.totalCases || 0);
      setDocCount(res.data.totalDocuments || 0);
      setHearings(res.data.upcomingHearings || []);
      setRecentCases(res.data.recentCases || []);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Advocate Dashboard
      </h1>

      {/* Stats Cards */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-blue-500 text-white p-5 rounded">
          <p className="text-sm">Total Clients</p>
          <p className="text-2xl font-bold">{clientCount}</p>
        </div>

        <div className="bg-green-500 text-white p-5 rounded">
          <p className="text-sm">Total Cases</p>
          <p className="text-2xl font-bold">{caseCount}</p>
        </div>

        <div className="bg-purple-500 text-white p-5 rounded">
          <p className="text-sm">Upcoming Hearings</p>
          <p className="text-2xl font-bold">{hearings.length}</p>
        </div>

        <div className="bg-orange-500 text-white p-5 rounded">
          <p className="text-sm">Documents Stored</p>
          <p className="text-2xl font-bold">{docCount}</p>
        </div>

      </div>

      {/* Upcoming Hearings */}

      <div className="mb-8">

        <h2 className="text-xl font-semibold mb-3">
          Upcoming Hearings
        </h2>

        {hearings.length === 0 && (
          <p className="text-gray-500">
            No upcoming hearings
          </p>
        )}

        {hearings.map((h) => (

          <div
            key={h.id}
            className="border p-3 rounded mb-2"
          >
            <p className="font-semibold">
              {h.case_title} — {new Date(h.hearing_date).toLocaleDateString()}
            </p>

            <p className="text-sm text-gray-600">
              Case: {h.case_number} | Court Hall: {h.court_hall || "N/A"}
            </p>

            <p className="text-sm">
              {h.notes}
            </p>
          </div>

        ))}

      </div>

      {/* Recent Cases */}

      <div>

        <h2 className="text-xl font-semibold mb-3">
          Recent Cases
        </h2>

        {recentCases.map((c) => (

          <div
            key={c.id}
            className="border p-3 rounded mb-2"
          >

            <p className="font-semibold">
              {c.case_title}
            </p>

            <p className="text-sm text-gray-600">
              Case Number: {c.case_number} | Status: {c.status}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}
