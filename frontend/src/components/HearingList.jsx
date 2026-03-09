import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function HearingList({ caseId }) {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/hearings/${caseId}`);
      setHearings(res.data);
    } catch (error) {
      console.error("Error loading hearings:", error);
      toast.error("Failed to load hearings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
    const handleHearingAdded = () => fetchHearings();
    window.addEventListener('hearingAdded', handleHearingAdded);
    return () => window.removeEventListener('hearingAdded', handleHearingAdded);
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent"></div>
          <p className="mt-2 text-slate-500 text-xs">Loading hearings...</p>
        </div>
      </div>
    );
  }

  if (hearings.length === 0) {
    return (
      <div className="mt-6 text-center py-10 bg-card rounded-lg border border-gold/10">
        <svg className="mx-auto h-10 w-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-3 text-slate-400 text-sm">No hearings scheduled yet</p>
        <p className="text-slate-600 text-xs mt-1">Add a hearing using the form above</p>
      </div>
    );
  }

  const statusBadge = (status) => {
    const styles = {
      Completed: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      Adjourned: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
      Scheduled: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    };
    return styles[status] || styles.Scheduled;
  };

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-4 text-white tracking-wide">HEARING TIMELINE</h2>

      <div className="space-y-3">
        {hearings.map((hearing) => (
          <div key={hearing.id}
            className={`border rounded-lg p-4 transition-colors ${
              hearing.status === 'Completed'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-card border-gold/10 hover:border-gold/25'
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Date */}
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-bold text-white text-sm">
                    {new Date(hearing.hearing_date).toLocaleDateString('en-IN', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Court Name */}
                <div className="flex items-center mb-1.5">
                  <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm text-slate-400">{hearing.court_hall}</p>
                </div>

                {/* Judge Name */}
                {hearing.judge_name && (
                  <div className="flex items-center mb-1.5">
                    <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-slate-400">Before: {hearing.judge_name}</p>
                  </div>
                )}

                {/* Notes */}
                {hearing.notes && (
                  <div className="mt-2.5 pt-2.5 border-t border-gold/10">
                    <p className="text-xs text-slate-500 italic">"{hearing.notes}"</p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="ml-3 flex-shrink-0">
                <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border ${statusBadge(hearing.status)}`}>
                  {hearing.status === 'Completed' ? '✓ COMPLETED' : hearing.status === 'Adjourned' ? '⏸ ADJOURNED' : '◷ SCHEDULED'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
