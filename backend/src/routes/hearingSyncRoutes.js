const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware');
const hearingSyncController = require('../controllers/hearingSyncController');

router.get('/status/:caseId', verifyToken, hearingSyncController.getCaseSyncStatus);
router.post('/trigger/:caseId', verifyToken, hearingSyncController.triggerCaseSync);

module.exports = router;

