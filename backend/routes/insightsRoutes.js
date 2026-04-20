const express = require("express");
const { generateDashboardInsights, getCaseInsights } = require("../controllers/insightsController");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/insights/generate
 * Generate dashboard insights from custom data
 * Body: { dashboardData, insightType, customQuery }
 */
router.post("/generate", auth, generateDashboardInsights);

/**
 * GET /api/insights/case/:caseId
 * Get insights for a specific case
 * Query: ?insightType=summary|analysis|recommendations|all
 */
router.get("/case/:caseId", auth, getCaseInsights);

module.exports = router;
