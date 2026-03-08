const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const caseController = require('../controllers/caseController');

/**
 * @route   POST /api/cases/create
 * @desc    Create a new case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post('/create', verifyToken, caseController.createCase);

/**
 * @route   GET /api/cases/all
 * @desc    Get all cases for logged-in advocate (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/all', verifyToken, caseController.getCases);

/**
 * @route   GET /api/cases/:id
 * @desc    Get single case by ID with full details (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:id', verifyToken, caseController.getCaseById);

/**
 * @route   PUT /api/cases/status/:id
 * @desc    Update case status (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/status/:id', verifyToken, caseController.updateCaseStatus);

/**
 * @route   PUT /api/cases/:id
 * @desc    Update case information (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/:id', verifyToken, caseController.updateCase);

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, caseController.deleteCase);

/**
 * @route   GET /api/cases/search?q=keyword
 * @desc    Search cases by title, number, or client name (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/search', verifyToken, caseController.searchCases);

/**
 * @route   GET /api/cases/filter?status=Active
 * @desc    Filter cases by status (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/filter', verifyToken, caseController.filterCasesByStatus);

/**
 * @route   PUT /api/cases/:id/status
 * @desc    Update case status (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/:id/status', verifyToken, caseController.updateCaseStatus);

/**
 * @route   GET /api/cases/count
 * @desc    Get total case count (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/count', verifyToken, caseController.getCaseCount);

module.exports = router;
