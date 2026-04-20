const axios = require("axios");
const { chunkText } = require("../utils/chunkText");

const HF_API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

// Create dedicated Hugging Face axios instance
// This prevents any baseURL interference from global axios configuration
const hfAxios = axios.create({
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
  // NO baseURL - we use absolute URLs only
});

// Add response interceptor for debugging
hfAxios.interceptors.response.use(
  (response) => {
    console.log(`✅ Hugging Face API Response (Status: ${response.status})`);
    return response;
  },
  (error) => {
    console.error("❌ Hugging Face API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Verify HF token on startup
console.log("🔑 Checking Hugging Face API key...");
console.log("  ✓ HUGGINGFACE_API_KEY:", HF_TOKEN ? "✓ Loaded" : "✗ NOT LOADED");
console.log("🔗 Hugging Face Endpoint: https://api-inference.huggingface.co/models/gpt2");

/**
 * Call Hugging Face Mistral-7B API with retry logic
 * @param {string} prompt - The input text/prompt
 * @param {Object} options - Additional options
 * @returns {Promise<{completion: string, tokens: number}>}
 */
async function callHuggingFace(prompt, options = {}) {
  const maxRetries = options.maxRetries || 2;
  const timeout = options.timeout || 15000;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Attempting Hugging Face (Attempt ${attempt}/${maxRetries})...`);
      console.log(`📍 Target URL: ${HF_API_URL}`);

      if (!HF_TOKEN) {
        throw new Error("HUGGINGFACE_API_KEY not set in environment");
      }

      // Prepare the payload
      const payload = {
        inputs: prompt,
        parameters: {
          max_length: options.maxTokens || 1000,
          temperature: options.temperature || 0.3,
          top_p: 0.9,
          do_sample: true,
        },
      };

      console.log(`📤 Sending request with ${prompt.length} characters of prompt text`);

      // Make API call with dedicated Hugging Face axios instance
      // This ensures no baseURL interference from global axios configuration
      const response = await hfAxios.post(HF_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        timeout,
      });

      console.log(`📥 Raw response received:`, {
        status: response.status,
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? "array" : typeof response.data,
      });

      // Extract completion from response
      const completion =
        response.data && response.data[0]?.generated_text
          ? response.data[0].generated_text
          : response.data;

      if (!completion || typeof completion !== "string") {
        console.error("❌ Invalid response format:", {
          completion: completion ? completion.substring(0, 100) : "null",
          type: typeof completion,
        });
        throw new Error("Invalid response format from Hugging Face");
      }

      console.log(`✅ Hugging Face success - Generated ${completion.length} characters`);
      return {
        completion: completion.trim(),
        tokens: 0, // HF doesn't return token count in free tier
      };
    } catch (error) {
      lastError = error;

      // Log full error details for debugging
      console.error(`❌ Attempt ${attempt} failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.message,
        errorType: error.code || "unknown",
        errorData: error.response?.data,
      });

      // Handle model loading delays (202 Accepted - model is loading)
      if (error.response?.status === 202) {
        console.warn("⏳ Model is loading, waiting before retry...", error.response?.data?.error);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
          continue;
        }
      }

      // Handle rate limits (429 Too Many Requests)
      if (error.response?.status === 429) {
        console.warn("⚠️ Rate limited, waiting before retry...");
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          continue;
        }
      }

      // Don't retry on client errors (4xx) except 429 and 202
      if (error.response?.status && error.response.status < 500 && error.response.status !== 429 && error.response.status !== 202) {
        throw error;
      }

      // Retry on server errors (5xx) or timeout
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        console.log(`⏱️ Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries exhausted
  console.error("🚫 All retry attempts failed");
  throw lastError || new Error("Failed to call Hugging Face API after retries");
}

/**
 * Process text with Hugging Face (handles chunking for large texts)
 * @param {string} text - Input text to process
 * @param {Object} options - Additional options
 * @returns {Promise<{completion: string, tokens: number}>}
 */
async function processWithHuggingFace(text, options = {}) {
  try {
    // Check text size
    if (!text || text.trim().length === 0) {
      throw new Error("Empty input text");
    }

    console.log(`🔄 Starting Hugging Face processing...`);
    console.log(`📏 Text size: ${text.length} characters`);
    console.log(`⚙️  Options:`, { 
      temperature: options.temperature || "default", 
      maxTokens: options.maxTokens || "default", 
      timeout: options.timeout || "default" 
    });

    // For large texts, chunk them (HF has token limits)
    const chunks = chunkText(text, {
      maxChunkSize: options.maxChunkSize || 1500,
      chunkOverlap: 100,
    });

    console.log(`📦 Text split into ${chunks.length} chunk(s)`);

    // Process chunks and collect responses
    const responses = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`📄 Processing chunk ${i + 1}/${chunks.length}...`);
      const result = await callHuggingFace(chunks[i], options);
      responses.push(result.completion);
    }

    // Merge responses
    const mergedCompletion = responses.join("\n\n");

    console.log(`✅ All chunks processed successfully`);
    return {
      completion: mergedCompletion,
      tokens: 0,
      chunksProcessed: chunks.length,
    };
  } catch (error) {
    console.error("❌ Hugging Face processing failed:", {
      message: error.message,
      errorCode: error.code,
    });
    throw error;
  }
}

/**
 * Format messages into a single prompt for Hugging Face
 * (Mistral-7B doesn't use chat format, just a prompt string)
 * @param {Array} messages - Array of message objects
 * @returns {string}
 */
function formatMessagesToPrompt(messages) {
  return messages
    .map((msg) => {
      if (msg.role === "system") {
        return `System: ${msg.content}`;
      } else if (msg.role === "user") {
        return `User: ${msg.content}`;
      } else if (msg.role === "assistant") {
        return `Assistant: ${msg.content}`;
      }
      return msg.content;
    })
    .join("\n\n");
}

module.exports = {
  callHuggingFace,
  processWithHuggingFace,
  formatMessagesToPrompt,
};
