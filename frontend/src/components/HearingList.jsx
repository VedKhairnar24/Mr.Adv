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
    
    // Listen for hearingAdded event
    const handleHearingAdded = () => {
      fetchHearings();
    };
    
    window.addEventListener('hearingAdded', handleHearingAdded);
    
    return () => {
      window.removeEventListener('hearingAdded', handleHearingAdded);
    };
  }, [caseId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading hearings...</p>
      </div>
    );
  }

  if (hearings.length === 0) {
    return (
      <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg border">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-3 text-gray-500 text-sm">No hearings scheduled yet</p>
        <p className="text-gray-400 text-xs mt-1">Add a hearing using the form above</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="font-bold text-lg mb-4 text-gray-900">Hearing Timeline</h2>
      
      <div className="space-y-3">
        {hearings.map((hearing) => (
          <div
            key={hearing.id}
            className={`border rounded-lg p-4 transition-colors ${
              hearing.status === 'Completed' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Date */}
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold text-gray-900">
                    {new Date(hearing.hearing_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Court Name */}
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">{hearing.court_hall}</p>
                </div>

                {/* Judge Name (if exists) */}
                {hearing.judge_name && (
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-gray-600">Before: {hearing.judge_name}</p>
                  </div>
                )}

                {/* Notes */}
                {hearing.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 italic">"{hearing.notes}"</p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="ml-3 flex-shrink-0">
                {hearing.status === 'Completed' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Completed
                  </span>
                ) : hearing.status === 'Adjourned' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏸ Adjourned
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ◷ Scheduled
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
