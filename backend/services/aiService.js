const { processWithHuggingFace, formatMessagesToPrompt } = require("./huggingfaceService");
const { cleanText, chunkText } = require("../utils/chunkText");

// Log environment variables (safety check)
console.log("🔑 Checking AI provider keys...");
console.log("  ✓ HUGGINGFACE_API_KEY:", process.env.HUGGINGFACE_API_KEY ? "✓ Loaded" : "✗ NOT LOADED");
console.log("  ℹ️  Provider: Hugging Face (mistralai/Mistral-7B-Instruct)");

/**
 * Unified AI response format
 * @typedef {Object} AIResponse
 * @property {string} provider - "huggingface" | "mock"
 * @property {string} insight - Generated text
 * @property {"success" | "fallback" | "mock"} status
 * @property {number} tokensUsed - Approximate tokens
 */

/**
 * Real Document-Based Insights - Extract ACTUAL facts and produce human-like analysis
 * Output format: DETAILED INSIGHTS + ANALYTICAL SUMMARY
 * @param {string} documentText - The document to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function generateRealDocumentInsights(documentText, options = {}) {
  console.log("📄 Starting REAL document-based insight generation...");

  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY not configured");
    }

    // Clean the text first
    const cleanedText = cleanText(documentText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error("Document text is empty after cleaning");
    }

    console.log(`📏 Document size: ${cleanedText.length} characters`);

    // Limit to 2000 characters for optimal API handling
    const limitedText = cleanedText.substring(0, 2000);

    // EXACT PROMPT - User specified
    const realPrompt = `You are an expert legal analyst.

Analyze the following case document and extract REAL insights.

Rules:
* Use ONLY the provided document
* Do NOT generate generic statements
* Do NOT say 'not mentioned' or 'appears'
* Extract actual names, dates, events, and facts

Output format:

DETAILED INSIGHTS:
• (real extracted facts)

ANALYTICAL SUMMARY:
(clear paragraph explaining the case, its progression, and key issues)

Document:
${limitedText}`;

    // Create messages for the AI
    const messages = [
      {
        role: "system",
        content: "You are an expert legal analyst. Extract real information from documents and provide insightful, professional analysis without assumptions or placeholders.",
      },
      {
        role: "user",
        content: realPrompt,
      },
    ];

    // Convert to prompt format
    const prompt = formatMessagesToPrompt(messages);

    console.log("🤖 Calling Hugging Face for real document insights...");

    // Call Hugging Face with strict error handling
    const result = await processWithHuggingFace(prompt, {
      temperature: 0.2, // Lower temperature = more factual, less creative
      maxTokens: 2500,
      timeout: 20000, // 20 seconds
      maxRetries: 2, // Retry once if model loading
      maxChunkSize: 2000,
    });

    console.log(`✅ Document insights complete`);

    // Use response as-is (already formatted by AI with DETAILED INSIGHTS + ANALYTICAL SUMMARY)
    const insight = result.completion || "";

    // Verify response has the required format
    if (!insight.includes("DETAILED INSIGHTS:") || !insight.includes("ANALYTICAL SUMMARY:")) {
      throw new Error("AI response missing required format sections");
    }

    return {
      provider: "huggingface",
      insight: insight,
      status: "success",
      tokensUsed: result.tokens || 0,
    };
  } catch (error) {
    console.error("❌ Hugging Face API failed:", {
      message: error.message,
      status: error.response?.status,
    });

    // Fallback: Smart extraction from document (returns REAL facts, NOT generic placeholders)
    console.log("⚠️ AI unavailable - Using smart document extraction fallback");
    return {
      provider: "fallback-extraction",
      insight: extractDocumentInsightsFallback(documentText),
      status: "fallback",
      tokensUsed: 0,
    };
  }
}

// Removed parseInsightResponse - AI response used as-is from Hugging Face

/**
 * Extract real document insights as fallback (manual extraction)
 * @param {string} documentText - The document to analyze
 * @returns {string}
 */
function extractDocumentInsightsFallback(documentText) {
  const cleanedText = cleanText(documentText);

  if (!cleanedText || cleanedText.trim().length === 0) {
    return `DETAILED INSIGHTS:
• No document content available for analysis

ANALYTICAL SUMMARY:
Unable to perform analysis due to missing document content. Please provide a valid case document.`;
  }

  // Extract names (likely party names)
  const nameMatches = cleanedText.match(/(?:Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee|Claimant|Against|v\.|vs\.)[\s:]*([A-Z][a-zA-Z\s&.,'-]+?)(?=,|;|[A-Z]|$)/gi);
  const names = nameMatches ? [...new Set(nameMatches.map(n => n.replace(/^(Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee|Claimant|Against|v\.|vs\.)\s*:?/i, "").trim()))].slice(0, 3) : [];

  // Extract dates
  const dateMatches = cleanedText.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|[0-1]?[0-9])[\s,]*\d{1,2}(?:st|nd|rd|th)?[\s,]*20\d{2}|\d{1,2}\/\d{1,2}\/20\d{2}/gi);
  const dates = dateMatches ? [...new Set(dateMatches)].slice(0, 3) : [];

  // Extract case type indicators
  const caseTypeMatch = cleanedText.match(/(Civil|Criminal|Matrimonial|Commercial|Writ|Appeal|Bail|Arbitration|Labor|Property|Contract|Theft|Fraud|Murder|Assault|Divorce|Custody|Dispute|Suit|Case|Matter)/gi);
  const caseType = caseTypeMatch ? caseTypeMatch[0] : "Legal Matter";

  // Extract status indicators
  const statusMatch = cleanedText.match(/(Pending|Filed|Active|Hearing|Trial|Appeal|Dismissed|Decided|Closed|Granted|Denied|Admitted|Rejected|In Progress)/gi);
  const status = statusMatch ? statusMatch[0] : "Status not specified";

  // Build insights
  const insights = [];

  if (names.length > 0) {
    insights.push(`Case involves: ${names.join(", ")}`);
  }

  insights.push(`Case type: ${caseType}`);
  insights.push(`Current status: ${status}`);

  if (dates.length > 0) {
    insights.push(`Key dates mentioned: ${dates.join("; ")}`);
  }

  // Extract numbers/amounts if present
  const amountMatch = cleanedText.match(/(?:Rs\.|₹|Rupees?|\$)\s*[\d,]+(?:\.\d{2})?/gi);
  if (amountMatch) {
    insights.push(`Financial amounts: ${amountMatch.slice(0, 2).join(", ")}`);
  }

  // Extract claims or key statements
  const claimMatch = cleanedText.match(/(?:claim|allege|assert|contend|argue|submit|state|held|found|ordered)\s+(?:that\s+)?([^.!?]+[.!?])/gi);
  if (claimMatch && claimMatch.length > 0) {
    const claim = claimMatch[0].replace(/^(?:claim|allege|assert|contend|argue|submit|state|held|found|ordered)\s+(?:that\s+)?/i, "").slice(0, 150);
    insights.push(`Key claim/holding: ${claim}`);
  }

  // Summary paragraph
  const summary = `This ${caseType.toLowerCase()} case ${names.length > 0 ? `involving ${names[0]}` : ""} is currently ${status.toLowerCase()}. The document outlines the legal position and relevant facts of the matter. ${dates.length > 0 ? `Important dates include ${dates[0]}.` : ""} Based on the document content, the case requires attention to procedural requirements and substantive arguments.`;

  return `DETAILED INSIGHTS:
${insights.map((insight, i) => `• ${insight}`).join("\n")}

ANALYTICAL SUMMARY:
${summary}`;
}

/**
 * Remove this function - use generateRealDocumentInsights instead
 * Kept for compatibility but routes to main function
 */
async function analyzeDocumentOnly(documentText, options = {}) {
  console.log("📄 Routing to generateRealDocumentInsights...");
  return generateRealDocumentInsights(documentText, options);
}

// Removed generateDocumentMockInsight - no generic fallback responses

/**
 * Main AI insight generator using Hugging Face (improved with real document analysis)
 * @param {Array} messages - Chat messages [{role, content}, ...] OR document text
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function generateInsight(messages, options = {}) {
  console.log("🔄 Starting improved AI insight generation...");

  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY not configured");
    }

    // Check if messages is actually a document string (for document analysis)
    if (typeof messages === "string" && messages.length > 50) {
      console.log("📄 Detected document string, using real document insights...");
      return generateRealDocumentInsights(messages, options);
    }

    // Convert messages to prompt format for Mistral
    const prompt = formatMessagesToPrompt(messages);

    console.log("🤖 Calling Hugging Face Mistral-7B...");

    // Call Hugging Face with retry logic
    const result = await processWithHuggingFace(prompt, {
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 1500,
      timeout: options.timeout || 15000,
      maxRetries: options.maxRetries || 2,
      maxChunkSize: options.maxChunkSize || 2000,
    });

    console.log(`✅ Insight generated via Hugging Face (${result.chunksProcessed || 1} chunk(s))`);

    return {
      provider: "huggingface",
      insight: result.completion,
      status: "success",
      tokensUsed: result.tokens || 0,
    };
  } catch (error) {
    console.error("❌ Hugging Face API failed:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });

    // Fallback: Return mock response for demo purposes
    console.log("⚠️ Using fallback response");
    return {
      provider: "fallback",
      insight: generateMockInsight(messages),
      status: "fallback",
      tokensUsed: 0,
    };
  }
}

/**
 * Generate mock insight only when AI completely unavailable
 * Returns document-based fallback, never generic responses
 */
function generateMockInsight(messages) {
  if (typeof messages === "string") {
    return extractDocumentInsightsFallback(messages);
  }
  return "AI response unavailable. Please check API configuration.";
}

module.exports = {
  generateInsight,
  generateRealDocumentInsights,
  analyzeDocumentOnly,
};
