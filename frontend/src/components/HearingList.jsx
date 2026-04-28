import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function HearingList({ caseId }) {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/hearings/case/${caseId}`);
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
  }, [caseId]);

  if (loading) {
    return (
      <div className="detail-card" style={{ padding: "24px" }}>
        <div className="detail-card-label">Hearing Timeline</div>
        <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent"></div>
            <p className="mt-2 text-slate-500 text-xs">Loading hearings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hearings.length === 0) {
    return (
      <div className="detail-card" style={{ padding: "24px" }}>
        <div className="detail-card-label">Hearing Timeline</div>
        <div className="text-center py-8">
        <svg className="mx-auto h-10 w-10 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
          <p className="mt-3 text-slate-300 text-sm">No hearings scheduled.</p>
          <p className="text-slate-500 text-xs mt-1">Hearings will appear after the next public-data sync.</p>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const styles = {
      Completed: "completed",
      Adjourned: "adjourned",
      Cancelled: "cancelled",
      Scheduled: "scheduled",
    };
    return styles[status] || styles.Scheduled;
  };

  return (
    <div className="detail-card" style={{ padding: "24px" }}>
      <div className="detail-card-label">Hearing Timeline</div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: 0,
            bottom: 0,
            width: "1px",
            background: "linear-gradient(to bottom, transparent, var(--gold) 10%, var(--gold) 90%, transparent)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {hearings.map((hearing) => (
          <div key={hearing.id} style={{ position: "relative", padding: "0 0 2px 44px" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "6px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--bg2)",
                border: "2px solid var(--gold)",
              }}
            />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    padding: "3px 10px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "11px",
                    color: "var(--gold)",
                    marginBottom: "6px",
                  }}
                >
                  {new Date(hearing.hearing_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {hearing.hearing_time ? ` · ${hearing.hearing_time.slice(0, 5)}` : ""}
                </span>

                <p style={{ color: "var(--muted)", fontSize: "12px" }}>
                  {(hearing.court_hall || hearing.court_name || "—").toLowerCase()}
                  {hearing.judge_name ? ` · ${hearing.judge_name.toLowerCase()}` : ""}
                </p>

                {hearing.notes ? (
                  <p style={{ color: "var(--muted2)", fontSize: "12px", marginTop: "4px", lineHeight: 1.4 }}>
                    {hearing.notes}
                  </p>
                ) : null}
              </div>

              <div style={{ flexShrink: 0, paddingTop: "2px" }}>
                <span className={`detail-status-badge ${statusBadge(hearing.status)}`}>
                  {hearing.status || "Scheduled"}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
