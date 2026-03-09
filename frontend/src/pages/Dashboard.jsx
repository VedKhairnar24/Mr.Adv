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
          <p className="mt-3 text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "TOTAL CLIENTS",
      value: clientCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "TOTAL CASES",
      value: caseCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
    },
    {
      label: "HEARINGS",
      value: hearings.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: "DOCUMENTS",
      value: docCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-lg border border-gold/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gold">{s.icon}</span>
            </div>
            <p className="text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Upcoming Hearings ── */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4 tracking-wide">Upcoming Hearings</h2>

        {hearings.length === 0 ? (
          <div className="bg-card rounded-lg border border-gold/10 p-8 text-center">
            <p className="text-slate-500 text-sm">No upcoming hearings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hearings.map((h) => (
              <div
                key={h.id}
                className="bg-card rounded-lg border border-gold/10 p-4 hover:border-gold/25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{h.case_title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Case: {h.case_number} &nbsp;·&nbsp; Court: {h.court_hall || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold">
                      {new Date(h.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {h.notes && <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{h.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Cases ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 tracking-wide">Recent Cases</h2>

        {recentCases.length === 0 ? (
          <div className="bg-card rounded-lg border border-gold/10 p-8 text-center">
            <p className="text-slate-500 text-sm">No cases yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="block bg-card rounded-lg border border-gold/10 p-4 hover:border-gold/25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{c.case_title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Case No: {c.case_number || "N/A"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border ${
                    c.status === "Active" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                    c.status === "Pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                    c.status === "On Hold" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" :
                    "text-slate-400 border-slate-500/30 bg-slate-500/10"
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
