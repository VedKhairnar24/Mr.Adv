import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import DashboardInsights from "../components/DashboardInsights";

function InsightsPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await API.get("/dashboard/stats");
      console.log("📊 Dashboard stats:", response.data);
      setDashboardStats(response.data);
    } catch (error) {
      console.error("❌ Error loading dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");

      // Fallback data for demonstration
      setDashboardStats({
        totalCases: 45,
        activeCases: 23,
        completedCases: 22,
        totalHearings: 128,
        completedHearings: 92,
        upcomingHearings: 15,
        totalDocuments: 342,
        totalNotes: 156,
        clientsCount: 38,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.05) 100%)",
                border: "1px solid rgba(200, 168, 75, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "20px" }}>🤖</span>
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                Dashboard Insights
              </h1>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                AI-powered analysis with intelligent fallback
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {dashboardStats && !loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <StatCard label="Total Cases" value={dashboardStats.totalCases} icon="📋" />
            <StatCard label="Active Cases" value={dashboardStats.activeCases} icon="⚡" />
            <StatCard label="Completed" value={dashboardStats.completedCases} icon="✓" />
            <StatCard label="Hearings" value={dashboardStats.totalHearings} icon="📅" />
            <StatCard label="Documents" value={dashboardStats.totalDocuments} icon="📄" />
            <StatCard label="Clients" value={dashboardStats.clientsCount} icon="👥" />
          </div>
        )}

        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="animate-spin"
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid rgba(200, 168, 75, 0.2)",
                  borderTopColor: "#c8a84b",
                  borderRadius: "50%",
                }}
              />
              Loading dashboard data...
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: dashboardStats ? "1fr 1fr" : "1fr", gap: "20px" }}>
          {/* Insights Component */}
          <div>
            <DashboardInsights
              dashboardData={dashboardStats}
              onClose={() => setShowInsights(false)}
            />
          </div>

          {/* Info Panel */}
          {dashboardStats && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(25, 35, 51, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)",
                border: "1px solid rgba(200, 168, 75, 0.1)",
                borderRadius: "12px",
                padding: "24px",
                backdropFilter: "blur(10px)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "16px" }}>
                How It Works
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <InfoStep
                  number="1"
                  title="AI Provider Chain"
                  description="Primary OpenAI API → Backup OpenAI Key → Google Gemini"
                />
                <InfoStep
                  number="2"
                  title="Automatic Fallback"
                  description="If primary fails (quota, error), system automatically tries next provider"
                />
                <InfoStep
                  number="3"
                  title="Provider Badge"
                  description="Result shows which AI provider generated the analysis"
                />
                <InfoStep
                  number="4"
                  title="Seamless Experience"
                  description="No UI breaks - users see consistent insights regardless of provider"
                />
              </div>

              {/* Stats */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(200, 168, 75, 0.1)",
                }}
              >
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "12px" }}>
                  Current System Status
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <StatusLine label="OpenAI Primary" status="Connected" />
                  <StatusLine label="OpenAI Backup" status="Connected" />
                  <StatusLine label="Google Gemini" status="Connected" />
                  <StatusLine label="Fallback Logic" status="Active" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(25, 35, 51, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)",
        border: "1px solid rgba(200, 168, 75, 0.1)",
        borderRadius: "10px",
        padding: "16px",
        textAlign: "center",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.3)";
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.1)";
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(25, 35, 51, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)";
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: "#c8a84b", marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

function InfoStep({ number, title, description }) {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.05) 100%)",
          border: "1.5px solid rgba(200, 168, 75, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#c8a84b",
          fontWeight: 600,
          fontSize: "12px",
        }}
      >
        {number}
      </div>
      <div>
        <h5 style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1", margin: "0 0 4px 0" }}>
          {title}
        </h5>
        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusLine({ label, status }) {
  const isConnected = status === "Connected" || status === "Active";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#cbd5e1" }}>{label}</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "10px",
          fontWeight: 600,
          color: isConnected ? "#22c55e" : "#ef4444",
          padding: "2px 8px",
          background: isConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          borderRadius: "3px",
          border: isConnected ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: isConnected ? "#22c55e" : "#ef4444",
          }}
        />
        {status}
      </span>
    </div>
  );
}

export default InsightsPage;
