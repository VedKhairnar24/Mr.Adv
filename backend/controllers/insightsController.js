const db = require("../config/db");
const { generateInsight } = require("../services/aiService");

/**
 * Generate dashboard insights
 * POST /insights/generate
 * @param {Object} req.body
 *   - dashboardData: {casesCount, hearingsCount, documentCount, completedCases, etc}
 *   - insightType: "summary" | "analysis" | "recommendations" | "all"
 *   - customQuery: optional custom user query
 * @param {Object} res
 */
async function generateDashboardInsights(req, res) {
  try {
    const { dashboardData, insightType = "summary", customQuery } = req.body;

    // Validation
    if (!dashboardData || typeof dashboardData !== "object") {
      return res.status(400).json({
        error: "Invalid dashboard data",
        message: "dashboardData must be a JSON object with case, hearing, document statistics",
      });
    }

    if (!["summary", "analysis", "recommendations", "all"].includes(insightType)) {
      return res.status(400).json({
        error: "Invalid insight type",
        message: 'insightType must be one of: "summary", "analysis", "recommendations", "all"',
      });
    }

    console.log("📊 Generating insights for:", {
      insightType,
      dataKeys: Object.keys(dashboardData),
    });

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(insightType, customQuery);

    // Format dashboard data for the prompt
    const dataContext = formatDashboardData(dashboardData);

    // Build messages
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Please analyze the following dashboard data and provide insights:\n\n${dataContext}`,
      },
    ];

    // Call AI service
    console.log("🤖 Calling AI service...");
    const aiResponse = await generateInsight(messages, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    console.log(`✅ Insight generated via ${aiResponse.provider} (${aiResponse.status})`);

    // Return formatted response
    res.json({
      success: true,
      data: {
        provider: aiResponse.provider,
        status: aiResponse.status,
        insight: aiResponse.insight,
        insightType,
        tokensUsed: aiResponse.tokensUsed || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error generating insights:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
    });

    res.status(503).json({
      success: false,
      error: "Insights temporarily unavailable",
      message: "Insights temporarily unavailable. Please retry.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get case-specific insights
 * GET /insights/case/:caseId
 */
async function getCaseInsights(req, res) {
  try {
    const { caseId } = req.params;
    const { insightType = "analysis" } = req.query;

    // Fetch case data
    const [caseData] = await db.promise().query("SELECT * FROM cases WHERE id = ?", [caseId]);

    if (!caseData || caseData.length === 0) {
      return res.status(404).json({
        error: "Case not found",
      });
    }

    const caseInfo = caseData[0];

    // Fetch related data (hearings, documents, notes)
    const [hearings] = await db.promise().query("SELECT * FROM hearings WHERE case_id = ?", [caseId]);
    const [documents] = await db.promise().query("SELECT * FROM documents WHERE case_id = ?", [caseId]);
    const [notes] = await db.promise().query("SELECT * FROM case_notes WHERE case_id = ?", [caseId]);

    // Prepare dashboard data for this case
    const dashboardData = {
      caseTitle: caseInfo.title,
      caseType: caseInfo.case_type,
      status: caseInfo.status,
      createdDate: caseInfo.created_at,
      hearingCount: hearings.length,
      completedHearings: hearings.filter((h) => h.status === "Completed").length,
      upcomingHearings: hearings.filter((h) => h.status === "Scheduled").length,
      documentCount: documents.length,
      noteCount: notes.length,
      recentActivity: {
        latestHearing: hearings[0]?.hearing_date,
        latestDocument: documents[0]?.uploaded_at,
        latestNote: notes[0]?.created_at,
      },
    };

    const systemPrompt = buildSystemPrompt(insightType, `Analyze this specific case`);
    const dataContext = formatDashboardData(dashboardData);

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Please analyze this case and provide ${insightType} insights:\n\n${dataContext}`,
      },
    ];

    const aiResponse = await generateInsight(messages, {
      temperature: 0.3,
      maxTokens: 1200,
    });

    res.json({
      success: true,
      data: {
        caseId,
        provider: aiResponse.provider,
        status: aiResponse.status,
        insight: aiResponse.insight,
        insightType,
        tokensUsed: aiResponse.tokensUsed || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error generating case insights:", error.message);

    res.status(503).json({
      success: false,
      error: "Insights temporarily unavailable",
      message: "Insights temporarily unavailable. Please retry.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Build system prompt based on insight type
 * @param {string} insightType
 * @param {string} customQuery
 * @returns {string}
 */
function buildSystemPrompt(insightType, customQuery = "") {
  const basePrompt = `You are an expert legal case management AI assistant specializing in the Indian legal system (IPC, BNS, CrPC, BNSS, CPC, Evidence Act).

Your role is to analyze dashboard data and case information to provide valuable, actionable insights for legal professionals.

Guidelines:
- Be concise but comprehensive
- Focus on practical, actionable recommendations
- Highlight risks, opportunities, and next steps
- Use professional legal terminology
- Format responses with clear sections and bullet points where appropriate
- Consider the legal framework and case management best practices`;

  let insightSpecificPrompt = "";

  switch (insightType) {
    case "summary":
      insightSpecificPrompt = `Provide a HIGH-LEVEL SUMMARY of the current dashboard data including:
- Overall case status and trends
- Key metrics (completed, pending, upcoming)
- Quick overview of activities`;
      break;

    case "analysis":
      insightSpecificPrompt = `Provide DETAILED ANALYSIS including:
- Current case status and progress
- Hearing timeline and outcomes
- Document management status
- Pattern analysis and trends
- Performance metrics`;
      break;

    case "recommendations":
      insightSpecificPrompt = `Provide ACTIONABLE RECOMMENDATIONS including:
- Next steps and action items
- Risk mitigation strategies
- Optimization opportunities
- Resource allocation suggestions
- Timeline improvements`;
      break;

    case "all":
      insightSpecificPrompt = `Provide a COMPREHENSIVE REPORT including:
1. Executive Summary
2. Detailed Analysis
3. Key Findings
4. Actionable Recommendations
5. Timeline and Next Steps`;
      break;

    default:
      insightSpecificPrompt = insightSpecificPrompt || "Provide general insights about the dashboard data.";
  }

  return `${basePrompt}\n\n${insightSpecificPrompt}${customQuery ? `\n\nUser Request: ${customQuery}` : ""}`;
}

/**
 * Format dashboard data into readable text
 * @param {Object} data
 * @returns {string}
 */
function formatDashboardData(data) {
  let formatted = "DASHBOARD DATA:\n";
  formatted += "================\n\n";

  const formatValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value || "N/A";
  };

  for (const [key, value] of Object.entries(data)) {
    const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
    formatted += `${formattedKey}: ${formatValue(value)}\n`;
  }

  return formatted;
}

module.exports = {
  generateDashboardInsights,
  getCaseInsights,
};
