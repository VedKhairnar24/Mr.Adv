const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/
 * @desc    Get complete dashboard statistics (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/', verifyToken, dashboardController.getDashboard);

/**
 * @route   GET /api/dashboard/case-types
 * @desc    Get case type statistics (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/case-types', verifyToken, dashboardController.getCaseTypeStats);

/**
 * @route   GET /api/dashboard/monthly-activity
 * @desc    Get this month's activity summary (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/monthly-activity', verifyToken, dashboardController.getMonthlyActivity);

module.exports = router;
