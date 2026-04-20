const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const documentController = require('../controllers/documentController');

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a legal document (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post(
  '/upload',
  verifyToken,
  upload.single('file'),
  documentController.uploadDocument
);

/**
 * @route   GET /api/documents/all/advocate
 * @desc    Get all documents for advocate across all cases (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/all/advocate', verifyToken, documentController.getAllDocuments);

/**
 * @route   GET /api/documents/case/:caseId
 * @desc    Get all documents for a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/case/:caseId', verifyToken, documentController.getDocuments);

/**
 * @route   GET /api/documents/:caseId
 * @desc    Get all documents for a case - legacy route (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:caseId', verifyToken, documentController.getDocuments);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, documentController.deleteDocument);

module.exports = router;
