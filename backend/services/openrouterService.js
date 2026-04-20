const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "openrouter/auto"; // Auto-select best available model

// Create dedicated OpenRouter axios instance
const openrouterAxios = axios.create({
  baseURL: OPENROUTER_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": "http://localhost:5177",
    "X-Title": "Mr.Adv Case System",
  },
});

// Verify API key on startup
console.log("🔑 Checking OpenRouter API key...");
console.log("  ✓ OPENROUTER_API_KEY:", OPENROUTER_API_KEY ? "✓ Loaded" : "✗ NOT LOADED");
console.log("🔗 OpenRouter Model: openrouter/auto (auto-selects best available model)");

/**
 * Call OpenRouter API with retry logic
 * @param {string} prompt - The input text/prompt
 * @param {Object} options - Additional options
 * @returns {Promise<{completion: string, tokens: number}>}
 */
async function callOpenRouter(prompt, options = {}) {
  const maxRetries = options.maxRetries || 2;
  const timeout = options.timeout || 25000;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Attempting OpenRouter (Attempt ${attempt}/${maxRetries})...`);

      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY not set in environment");
      }

      // Prepare the payload for chat completions
      const payload = {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2500,
      };

      console.log(`📤 Sending request with ${prompt.length} characters`);

      // Make API call
      const response = await openrouterAxios.post("", payload, {
        timeout,
      });

      console.log(`📥 Raw response received:`, {
        status: response.status,
        hasData: !!response.data,
      });

      // Extract completion from OpenRouter response
      const completion =
        response.data?.choices?.[0]?.message?.content;

      if (!completion || typeof completion !== "string") {
        console.error("❌ Invalid response format:", {
          completion: completion ? completion.substring(0, 100) : "null",
          type: typeof completion,
        });
        throw new Error("Invalid response format from OpenRouter");
      }

      // Get token usage if available
      const tokens = response.data?.usage?.total_tokens || 0;

      console.log(`✅ OpenRouter success - Generated ${completion.length} characters`);
      return {
        completion: completion.trim(),
        tokens: tokens,
      };
    } catch (error) {
      lastError = error;

      // Log error details for debugging (without exposing sensitive info)
      console.error(`❌ Attempt ${attempt} failed:`, {
        status: error.response?.status,
        message: error.message,
        errorType: error.code || "unknown",
      });

      // Handle rate limits (429 Too Many Requests)
      if (error.response?.status === 429) {
        console.warn("⚠️ Rate limited, waiting before retry...");
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
      }

      // Don't retry on client errors (4xx) except 429
      if (error.response?.status && error.response.status < 500 && error.response.status !== 429) {
        throw error;
      }

      // Retry on server errors (5xx) or timeout
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏱️ Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries exhausted
  console.error("🚫 All retry attempts failed");
  throw lastError || new Error("Failed to call OpenRouter API after retries");
}

/**
 * Process text with OpenRouter (handles chunking for large texts)
 * @param {string} text - Input text to process
 * @param {Object} options - Additional options
 * @returns {Promise<{completion: string, tokens: number}>}
 */
async function processWithOpenRouter(text, options = {}) {
  try {
    // Check text size
    if (!text || text.trim().length === 0) {
      throw new Error("Empty input text");
    }

    console.log(`🔄 Starting OpenRouter processing...`);
    console.log(`📏 Text size: ${text.length} characters`);

    // For OpenRouter, we can send larger prompts (up to model context limit)
    // Limit to 8000 characters to stay well within context window
    const limitedText = text.substring(0, 8000);

    console.log(`📦 Processing text (limited to ${limitedText.length} chars)`);

    const result = await callOpenRouter(limitedText, options);

    console.log(`✅ Text processed successfully`);
    return {
      completion: result.completion,
      tokens: result.tokens,
    };
  } catch (error) {
    console.error("❌ OpenRouter processing failed:", {
      message: error.message,
    });
    throw error;
  }
}

/**
 * Format messages into OpenRouter chat format
 * @param {Array} messages - Array of message objects [{role, content}]
 * @returns {Array} Formatted messages
 */
function formatMessagesForOpenRouter(messages) {
  return messages.map((msg) => ({
    role: msg.role || "user",
    content: msg.content || "",
  }));
}

module.exports = {
  callOpenRouter,
  processWithOpenRouter,
  formatMessagesForOpenRouter,
};
