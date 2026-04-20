const express = require("express");
const router = express.Router();
const { generateInsight } = require("../services/aiService");

/**
 * Test endpoint to verify AI service is working
 * GET /api/test/ai
 */
router.get("/ai", async (req, res) => {
  try {
    console.log("🧪 Testing AI service...");
    
    const testMessages = [
      {
        role: "user",
        content: "Hello, please respond with a single word: test"
      }
    ];

    const result = await generateInsight(testMessages, {
      temperature: 0.3,
      maxTokens: 50,
    });

    res.json({
      success: true,
      provider: result.provider,
      status: result.status,
      message: "AI service is working!",
      response: result.insight,
    });
  } catch (error) {
    console.error("❌ AI service test failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      provider: "none",
      hint: "Check that API keys are valid and providers are accessible",
    });
  }
});

module.exports = router;
