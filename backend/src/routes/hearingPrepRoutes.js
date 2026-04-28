const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware');
const hearingPrepController = require('../controllers/hearingPrepController');

router.use(verifyToken);

// Case summary generator
router.get('/:caseId/summary', hearingPrepController.caseSummary);

// Hearing prep briefing
router.get('/:caseId/briefing', hearingPrepController.briefing);

// Suggested arguments
router.get('/:caseId/arguments', hearingPrepController.arguments);

// Missing document checklist
router.get('/:caseId/missing-docs', hearingPrepController.missingDocs);

// “Be prepared tomorrow” assistant
router.get('/:caseId/be-prepared-tomorrow', hearingPrepController.bePreparedTomorrow);

// Pre-hearing notification summaries (payload useful for notifications)
router.get('/:caseId/pre-hearing-summary', hearingPrepController.preHearingSummary);

module.exports = router;

