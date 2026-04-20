const { generateInsightViaOpenRouter } = require("./openrouterService");
const { cleanText, chunkText } = require("../utils/chunkText");

// Log environment variables (safety check)
console.log("🔑 Checking AI provider configuration...");
console.log("  ✓ OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "✓ Loaded" : "✗ NOT LOADED");
console.log("  ℹ️  Provider: OpenRouter (Direct API)");
console.log("  ℹ️  Model: mistralai/mistral-7b-instruct");

/**
 * Unified AI response format
 * @typedef {Object} AIResponse
 * @property {string} provider - "openrouter"
 * @property {string} insight - Generated text
 * @property {"success" | "error"} status
 * @property {number} tokensUsed - Approximate tokens
 */

/**
 * Real Document-Based Insights - Extract ACTUAL facts and produce structured analysis
 * Output format: Structured legal analysis from OpenRouter API
 * @param {string} documentText - The document to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function generateRealDocumentInsights(documentText, options = {}) {
  console.log("📄 Starting document-based insight generation via OpenRouter...");

  try {
    if (!process.env.MAKE_WEBHOOK_URL) {
      throw new Error("MAKE_WEBHOOK_URL not configured - Make.com webhook required");
    }

    // Clean the text first
    const cleanedText = cleanText(documentText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error("Document text is empty after cleaning");
    }

    console.log(`📏 Document size: ${cleanedText.length} characters`);

    // Limit to first 2000 characters for optimal processing
    const limitedText = cleanedText.substring(0, 2000);

    // Call OpenRouter API
    const result = await generateInsightViaOpenRouter(limitedText, {
      temperature: options.temperature || 0.2,
      maxTokens: options.maxTokens || 2500,
    });

    console.log(`✅ Document insights generated successfully`);

    return {
      provider: "openrouter",
      insight: result.insight,
      status: "success",
      tokensUsed: result.tokensUsed || 0,
    };
  } catch (error) {
    console.error("❌ OpenRouter API failed:", {
      message: error.message,
      status: error.response?.status,
    });

    throw error;
  }
}

/**
 * Analyze document text using OpenRouter API
 * @param {string} documentText - The document to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function analyzeDocumentOnly(documentText, options = {}) {
  console.log("📄 Routing to generateRealDocumentInsights...");
  return generateRealDocumentInsights(documentText, options);
}

/**
 * Main AI insight generator using OpenRouter
 * @param {string|Array} input - Document text or messages array
 * @param {Object} options - Additional options
 * @returns {Promise<AIResponse>}
 */
async function generateInsight(input, options = {}) {
  console.log("🔄 Starting AI insight generation via OpenRouter...");

  try {
    if (!process.env.MAKE_WEBHOOK_URL) {
      throw new Error("MAKE_WEBHOOK_URL not configured - Make.com webhook required");
    }

    let textToAnalyze = "";

    // Handle both document text and messages array
    if (typeof input === "string") {
      textToAnalyze = input;
    } else if (Array.isArray(input)) {
      // Extract user message from array
      const userMessage = input.find(msg => msg.role === "user");
      textToAnalyze = userMessage ? userMessage.content : JSON.stringify(input);
    } else {
      throw new Error("Invalid input format for insight generation");
    }

    // Clean and validate text
    const cleanedText = cleanText(textToAnalyze);
    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error("No valid text content to analyze");
    }

    console.log("🤖 Calling OpenRouter API...");

    // Call OpenRouter
    const result = await generateInsightViaOpenRouter(cleanedText, {
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 1500,
    });

    console.log(`✅ Insight generated successfully via OpenRouter`);

    return {
      provider: "openrouter",
      insight: result.insight,
      status: "success",
      tokensUsed: result.tokensUsed || 0,
    };
  } catch (error) {
    console.error("❌ OpenRouter API failed:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });

    // No fallback - inform user to retry
    throw error;
  }
}

module.exports = {
  generateInsight,
  generateRealDocumentInsights,
  analyzeDocumentOnly,
};
