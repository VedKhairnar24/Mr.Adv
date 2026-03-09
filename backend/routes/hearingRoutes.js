const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const hearingController = require('../controllers/hearingController');

/**
 * @route   POST /api/hearings/add
 * @desc    Add a hearing to a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post('/add', verifyToken, hearingController.addHearing);

/**
 * @route   GET /api/hearings/upcoming
 * @desc    Get upcoming hearings for dashboard (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/upcoming', verifyToken, hearingController.getUpcomingHearings);

/**
 * @route   GET /api/hearings/:caseId
 * @desc    Get all hearings for a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:caseId', verifyToken, hearingController.getHearings);

/**
 * @route   PUT /api/hearings/status/:id
 * @desc    Update hearing status (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/status/:id', verifyToken, hearingController.updateHearingStatus);

/**
 * @route   DELETE /api/hearings/:id
 * @desc    Delete a hearing (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, hearingController.deleteHearing);

module.exports = router;
