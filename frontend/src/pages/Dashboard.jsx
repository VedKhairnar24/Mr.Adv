import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "TOTAL CLIENTS", value: clientCount },
    { label: "TOTAL CASES", value: caseCount },
    { label: "HEARINGS", value: hearings.length },
    { label: "DOCUMENTS", value: docCount }
  ];

  return (
    <div className="text-white">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-wide">Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1F2937] rounded-lg border border-gold/10 p-5 hover:border-gold/30 transition"
          >
            <p className="text-3xl font-extrabold text-gold">{s.value}</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/60 mt-2">
              {s.label}
            </p>
          </div>
        ))}

      </div>

      {/* Upcoming Hearings */}
      <div className="mb-10">

        <h2 className="text-lg font-bold mb-4 tracking-wide">
          Upcoming Hearings
        </h2>

        {hearings.length === 0 ? (
          <div className="bg-[#1F2937] rounded-lg border border-gold/10 p-8 text-center">
            <p className="text-white/50 text-sm">
              No upcoming hearings
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              const today = new Date().toDateString();
              const tomorrow = new Date(Date.now() + 86400000).toDateString();
              const grouped = {};
              hearings.forEach((h) => {
                const d = new Date(h.hearing_date).toDateString();
                const label = d === today ? "Today" : d === tomorrow ? "Tomorrow" : new Date(h.hearing_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
                if (!grouped[label]) grouped[label] = [];
                grouped[label].push(h);
              });
              return Object.entries(grouped).map(([label, items]) => (
                <div key={label}>
                  <p className="text-xs font-bold tracking-wider text-gold mb-2">{label.toUpperCase()}</p>
                  <div className="space-y-2 mb-4">
                    {items.map((h) => (
                      <Link
                        key={h.id}
                        to={`/cases/${h.case_id}`}
                        className="block bg-[#1F2937] rounded-lg border border-gold/10 p-4 hover:border-gold/30 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{h.case_title}</p>
                            <p className="text-xs text-white/50 mt-1">
                              {h.court_name || h.court_hall || "Court N/A"}
                              {h.hearing_time && ` · ${h.hearing_time.slice(0, 5)}`}
                              {h.stage && ` · ${h.stage}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gold">
                              {new Date(h.hearing_date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                            {h.notes && (
                              <p className="text-xs text-white/40 mt-1 max-w-[200px] truncate">{h.notes}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

      </div>

      {/* Recent Cases */}
      <div>

        <h2 className="text-lg font-bold mb-4 tracking-wide">
          Recent Cases
        </h2>

        {recentCases.length === 0 ? (
          <div className="bg-[#1F2937] rounded-lg border border-gold/10 p-8 text-center">
            <p className="text-white/50 text-sm">
              No cases yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {recentCases.map((c) => (

              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="block bg-[#1F2937] rounded-lg border border-gold/10 p-4 hover:border-gold/30 transition"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="font-bold text-white text-sm">
                      {c.case_title}
                    </p>

                    <p className="text-xs text-white/50 mt-1">
                      Case No: {c.case_number || "N/A"}
                    </p>

                  </div>

                  <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border ${
                    c.status === "Active"
                      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                      : c.status === "Pending"
                      ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                      : c.status === "On Hold"
                      ? "text-orange-400 border-orange-400/30 bg-orange-400/10"
                      : "text-white/50 border-white/20 bg-white/5"
                  }`}>
                    {c.status?.toUpperCase()}
                  </span>

                </div>

              </Link>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}