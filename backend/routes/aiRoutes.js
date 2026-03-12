const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

/**
 * @route   POST /api/ai/generate/:caseId
 * @desc    Generate AI insights for a case
 * @access  Private
 */
router.post('/generate/:caseId', verifyToken, aiController.generateInsights);

/**
 * @route   GET /api/ai/notes/:caseId
 * @desc    Get all AI notes for a case
 * @access  Private
 */
router.get('/notes/:caseId', verifyToken, aiController.getNotes);

/**
 * @route   DELETE /api/ai/notes/:id
 * @desc    Delete an AI note
 * @access  Private
 */
router.delete('/notes/:id', verifyToken, aiController.deleteNote);

module.exports = router;
