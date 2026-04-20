const axios = require("axios");

/**
 * OpenRouter service - Direct API calls to OpenRouter
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Create axios instance for OpenRouter
const orAxios = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors for logging
orAxios.interceptors.request.use(
  (config) => {
    console.log(`📤 Sending request to OpenRouter API...`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error.message);
    return Promise.reject(error);
  }
);

orAxios.interceptors.response.use(
  (response) => {
    console.log(`✅ OpenRouter response received (Status: ${response.status})`);
    return response;
  },
  (error) => {
    console.error("❌ OpenRouter error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

/**
 * Generate legal insights using OpenRouter API directly
 * @param {string} text - Document text or analysis prompt
 * @param {Object} options - Additional options
 * @returns {Promise<{insight: string, provider: string, status: string}>}
 */
async function generateInsightViaOpenRouter(text, options = {}) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not configured in environment");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Empty text provided for analysis");
    }

    console.log("🔄 Generating insight via OpenRouter API...");
    console.log(`📏 Text size: ${text.length} characters`);

    // Prepare OpenRouter request
    const payload = {
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "user",
          content: `You are a senior legal analyst.

Analyze the following case document strictly based on its content.

Rules:
- Do NOT generate assumptions
- If data is missing, say 'Not mentioned'
- Give clear, real insights

Output:
1. Case Summary (3-5 lines)
2. Key Insights (bullet points)
3. Timeline (if present)
4. Risks / Observations
5. Missing Information

Document:
${text.trim()}`,
        },
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 1500,
    };

    // Call OpenRouter API
    const response = await orAxios.post(OPENROUTER_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost",
      },
    });

    // Extract insight from response
    const insight = response.data?.choices?.[0]?.message?.content;

    if (!insight || typeof insight !== "string") {
      throw new Error("Invalid response format from OpenRouter");
    }

    console.log(`✅ Insight generated successfully (${insight.length} characters)`);

    return {
      insight: insight.trim(),
      provider: "openrouter",
      status: "success",
      tokensUsed: response.data?.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("❌ Error generating insight via OpenRouter:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });

    throw error;
  }
}

module.exports = {
  generateInsightViaOpenRouter,
};
