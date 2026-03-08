const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const evidenceController = require('../controllers/evidenceController');

/**
 * @route   POST /api/evidence/upload
 * @desc    Upload evidence for a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post(
  '/upload',
  verifyToken,
  upload.single('file'),
  evidenceController.uploadEvidence
);

/**
 * @route   GET /api/evidence/:caseId
 * @desc    Get all evidence for a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:caseId', verifyToken, evidenceController.getEvidence);

/**
 * @route   DELETE /api/evidence/:id
 * @desc    Delete evidence (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, evidenceController.deleteEvidence);

module.exports = router;
