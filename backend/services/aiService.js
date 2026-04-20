const { processWithOpenRouter } = require("./openrouterService");
const { cleanText } = require("../utils/chunkText");

// Log environment variables (safety check)
console.log("🔑 Checking AI provider keys...");
console.log("  ✓ OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "✓ Loaded" : "✗ NOT LOADED");
console.log("  ℹ️  Provider: OpenRouter (mistralai/mistral-7b-instruct)");

/**
 * Unified AI response format
 * @typedef {Object} AIResponse
 * @property {string} provider - "openrouter"
 * @property {string} insight - Generated text
 * @property {"success"} status
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
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    // Clean the text first
    const cleanedText = cleanText(documentText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error("Document text is empty after cleaning");
    }

    console.log(`📏 Document size: ${cleanedText.length} characters`);

    // Limit to 8000 characters for optimal API handling
    const limitedText = cleanedText.substring(0, 8000);

    // EXACT PROMPT - Make.com specification with strict formatting rules
    const realPrompt = `You are a senior legal analyst.

Analyze the following case document strictly based on its content.

STRICT OUTPUT RULES:
- Do NOT use markdown formatting
- Do NOT use symbols like **, *, #, or bullet asterisks
- Use plain text only
- Use simple dash (-) for bullet points
- Keep output clean, readable, and professional
- Avoid phrases like "Document appears" or "fallback analysis"
- Do NOT mention AI or analysis process

Rules:
- Do NOT generate assumptions
- If data is missing, say 'Not mentioned'
- Give clear, real insights

Output format:
1. Case Summary (3-5 lines)
2. Key Insights (use - for bullet points)
3. Timeline (if present)
4. Risks or Observations
5. Missing Information

Document:
${limitedText}`;

    // Create messages for the AI
    const messages = [
      {
        role: "user",
        content: realPrompt,
      },
    ];

    console.log("🤖 Calling OpenRouter for real document insights...");

    // Call OpenRouter with strict error handling
    const result = await processWithOpenRouter(realPrompt, {
      temperature: 0.2, // Lower temperature = more factual, less creative
      maxTokens: 2500,
      timeout: 30000, // 30 seconds
      maxRetries: 2, // Retry once if model loading
    });

    console.log(`✅ Document insights complete`);

    // Return the response as-is from OpenRouter
    return {
      provider: "openrouter",
      insight: result.completion || "",
      status: "success",
      tokensUsed: result.tokens || 0,
    };
  } catch (error) {
    console.error("❌ OpenRouter API failed:", {
      message: error.message,
      status: error.response?.status,
    });

    // Re-throw error - no fallback
    throw error;
  }
}



/**
 * Main AI insight generator using OpenRouter ONLY
 * @param {string} documentText - Document text to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function generateInsight(documentText, options = {}) {
  console.log("🔄 Starting AI insight generation with OpenRouter...");

  // Must be a document string
  if (typeof documentText !== "string" || documentText.length < 50) {
    throw new Error("Invalid document text provided");
  }

  // Call generateRealDocumentInsights directly
  return generateRealDocumentInsights(documentText, options);
}

module.exports = {
  generateInsight,
  generateRealDocumentInsights,
};
