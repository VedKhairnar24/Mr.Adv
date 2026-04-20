import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function DashboardInsights({ dashboardData, onClose }) {
  const [insightType, setInsightType] = useState("summary");
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(!document.documentElement.classList.contains('light-theme'));

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(!document.documentElement.classList.contains('light-theme'));
    };
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const insightTypes = [
    { value: "summary", label: "📊", title: "Summary", description: "Quick overview" },
    { value: "analysis", label: "🔍", title: "Analysis", description: "Detailed insights" },
    { value: "recommendations", label: "💡", title: "Recommendations", description: "Action items" },
    { value: "all", label: "📋", title: "Full Report", description: "Complete analysis" },
  ];

  const generateInsights = async () => {
    try {
      // Use dashboard data if available, otherwise use test data
      const dataToSend = dashboardData || {
        totalCases: 10,
        activeCases: 5,
        completedCases: 5,
        totalHearings: 20,
        totalDocuments: 30,
        clientsCount: 8,
      };

      console.log("📤 Sending insight request with data:", dataToSend);
      setLoading(true);
      toast.loading("Generating insights via OpenRouter AI...", { id: "insight-loading" });

      const response = await API.post("/insights/generate", {
        dashboardData: dataToSend,
        insightType,
        customQuery: customQuery || undefined,
      });

      console.log("📥 API Response:", response.data);

      // Handle different response formats
      const responseData = response.data?.data || response.data;

      if (!responseData.insight) {
        throw new Error("No insight in response: " + JSON.stringify(responseData));
      }

      setInsight(responseData.insight);
      setProvider("OpenRouter");
      setStatus("success");

      toast.dismiss("insight-loading");
      toast.success("✅ Insights generated successfully via OpenRouter", { duration: 3 });
    } catch (error) {
      console.error("❌ Error generating insights:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.dismiss("insight-loading");
      toast.error("Insights temporarily unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: isDarkMode 
          ? "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(250, 250, 247, 0.95) 0%, rgba(245, 242, 237, 0.98) 100%)",
        border: isDarkMode 
          ? "1px solid rgba(200, 168, 75, 0.15)"
          : "1px solid rgba(184, 146, 15, 0.20)",
        borderRadius: "16px",
        padding: "32px",
        backdropFilter: "blur(20px)",
        boxShadow: isDarkMode
          ? "0 20px 60px rgba(0, 0, 0, 0.4)"
          : "0 20px 60px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Premium Header with Close Button */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            background: isDarkMode
              ? "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)"
              : "linear-gradient(135deg, #4b5563 0%, #6b7280 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px"
          }}>
            AI-Powered Insights
          </h2>
          <p style={{
            fontSize: "13px",
            color: "var(--muted)",
            margin: "0",
            fontWeight: "500",
            letterSpacing: "0.3px"
          }}>
            Generate comprehensive legal analysis using advanced AI
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(200, 168, 75, 0.1) 0%, rgba(200, 168, 75, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(184, 146, 15, 0.1) 0%, rgba(184, 146, 15, 0.05) 100%)",
              border: isDarkMode
                ? "1px solid rgba(200, 168, 75, 0.2)"
                : "1px solid rgba(184, 146, 15, 0.25)",
              color: isDarkMode ? "#c8a84b" : "#b8920f",
              cursor: "pointer",
              fontSize: "22px",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.1) 100%)"
                : "linear-gradient(135deg, rgba(184, 146, 15, 0.2) 0%, rgba(184, 146, 15, 0.1) 100%)";
              e.currentTarget.style.transform = "rotate(90deg) scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? "linear-gradient(135deg, rgba(200, 168, 75, 0.1) 0%, rgba(200, 168, 75, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(184, 146, 15, 0.1) 0%, rgba(184, 146, 15, 0.05) 100%)";
              e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Insight Type Selection - Card Style */}
      <div style={{ marginBottom: "28px" }}>
        <label style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "var(--muted)",
          display: "block",
          marginBottom: "14px",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}>
          Analysis Type
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {insightTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setInsightType(type.value)}
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                border: `2px solid ${
                  insightType === type.value
                    ? "rgba(200, 168, 75, 0.6)"
                    : "rgba(200, 168, 75, 0.15)"
                }`,
                background:
                  insightType === type.value
                    ? "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.08) 100%)"
                    : "linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)",
                color: insightType === type.value ? "#c8a84b" : "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                fontSize: "14px",
                fontWeight: "600",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (insightType !== type.value) {
                  e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.4)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.1) 0%, rgba(200, 168, 75, 0.05) 100%)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                } else {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.background = insightType === type.value
                  ? "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)";
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{type.label}</div>
              <div style={{ fontWeight: "600", fontSize: "12px" }}>{type.title}</div>
              <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Textarea */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "var(--muted)",
          display: "block",
          marginBottom: "10px",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}>
          Custom Query
        </label>
        <textarea
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="Enter a specific question or focus area (e.g., 'Focus on pending cases and risks')"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1.5px solid rgba(200, 168, 75, 0.2)",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(25, 35, 51, 0.3) 100%)",
            color: "var(--white)",
            fontSize: "13px",
            fontFamily: "inherit",
            resize: "vertical",
            minHeight: "90px",
            transition: "all 0.3s ease",
            letterSpacing: "0.2px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.5)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(200, 168, 75, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(200, 168, 75, 0.2)";
            e.currentTarget.style.boxShadow = "none";
          }}
          disabled={loading}
        />
      </div>

      {/* Premium Generate Button */}
      <button
        onClick={generateInsights}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: "10px",
          border: "none",
          background: loading
            ? "linear-gradient(135deg, rgba(200, 168, 75, 0.1) 0%, rgba(200, 168, 75, 0.05) 100%)"
            : "linear-gradient(135deg, #c8a84b 0%, #d4b860 50%, #a88a2e 100%)",
          color: loading ? "#94a3b8" : "#0f172a",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "700",
          fontSize: "14px",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          letterSpacing: "0.3px",
          boxShadow: loading ? "none" : "0 10px 30px rgba(200, 168, 75, 0.25)",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(200, 168, 75, 0.4)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(200, 168, 75, 0.25)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {loading ? (
          <>
            <svg
              style={{ animation: "spin 1s linear infinite" }}
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating Analysis...</span>
          </>
        ) : (
          <>
            <span>🤖</span>
            <span>Generate Insights</span>
          </>
        )}
      </button>

      {/* Results Section - Enhanced Design */}
      {insight && (
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(200, 168, 75, 0.25)",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(25, 35, 51, 0.4) 100%)",
            padding: "24px",
            animation: "slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "inset 0 1px 0 rgba(200, 168, 75, 0.1)",
          }}
        >
          {/* Provider Badge and Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.6px",
                padding: "6px 14px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.1) 100%)",
                color: "#c8a84b",
                border: "1px solid rgba(200, 168, 75, 0.3)",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#c8a84b",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              OpenRouter AI
            </span>
          </div>

          {/* Content Section */}
          <div
            style={{
              fontSize: "13px",
              color: "var(--white)",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(25, 35, 51, 0.2) 100%)",
              padding: "18px",
              borderRadius: "8px",
              border: "1px solid rgba(200, 168, 75, 0.1)",
              marginBottom: "18px",
              fontFamily: '"Segoe UI", system-ui, sans-serif',
              letterSpacing: "0.1px",
            }}
          >
            {insight}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(insight);
                toast.success("✓ Copied to clipboard");
              }}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(200, 168, 75, 0.3)",
                background: "linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.03) 100%)",
                color: "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "12px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.1) 100%)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.03) 100%)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                setInsight(null);
                setProvider(null);
                setStatus(null);
              }}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(200, 168, 75, 0.3)",
                background: "linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.03) 100%)",
                color: "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "12px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.2) 0%, rgba(200, 168, 75, 0.1) 100%)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(200, 168, 75, 0.03) 100%)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              🔄 New Analysis
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          [style*="padding: 32px"] {
            padding: 20px !important;
          }
          [style*="grid-template-columns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardInsights;
