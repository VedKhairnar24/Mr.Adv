const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const caseLookupController = require('../controllers/caseLookupController');

/**
 * @route   POST /api/case-lookup/search/cnr
 * @desc    Search case by CNR number
 * @access  Private (Requires JWT token)
 */
router.post('/search/cnr', verifyToken, caseLookupController.searchByCNR);

/**
 * @route   POST /api/case-lookup/search/case-number
 * @desc    Search case by case number
 * @access  Private (Requires JWT token)
 */
router.post('/search/case-number', verifyToken, caseLookupController.searchByCaseNumber);

/**
 * @route   POST /api/case-lookup/import
 * @desc    Import external case to advocate's dashboard
 * @access  Private (Requires JWT token)
 */
router.post('/import', verifyToken, caseLookupController.importCase);

/**
 * @route   POST /api/case-lookup/sync/:caseId
 * @desc    Auto-sync case metadata from external source
 * @access  Private (Requires JWT token)
 */
router.post('/sync/:caseId', verifyToken, caseLookupController.syncCase);

/**
 * @route   POST /api/case-lookup/bulk-sync
 * @desc    Bulk sync all external cases
 * @access  Private (Requires JWT token)
 */
router.post('/bulk-sync', verifyToken, caseLookupController.bulkSync);

/**
 * @route   GET /api/case-lookup/sync-history/:caseId
 * @desc    Get sync history for a case
 * @access  Private (Requires JWT token)
 */
router.get('/sync-history/:caseId', verifyToken, caseLookupController.getSyncHistory);

/**
 * @route   GET /api/case-lookup/cache/:cacheId
 * @desc    Get cached case details
 * @access  Private (Requires JWT token)
 */
router.get('/cache/:cacheId', verifyToken, caseLookupController.getCachedCase);

/**
 * @route   GET /api/case-lookup/cache/search?q=keyword
 * @desc    Search cached cases
 * @access  Private (Requires JWT token)
 */
router.get('/cache/search', verifyToken, caseLookupController.searchCachedCases);

module.exports = router;
