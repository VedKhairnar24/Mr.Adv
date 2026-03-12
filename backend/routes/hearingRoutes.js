const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const hearingController = require('../controllers/hearingController');

// POST /api/hearings/add - Add a hearing
router.post('/add', verifyToken, hearingController.addHearing);

// GET /api/hearings/all - Get all hearings for advocate
router.get('/all', verifyToken, hearingController.getAllHearings);

// GET /api/hearings/upcoming - Get upcoming hearings
router.get('/upcoming', verifyToken, hearingController.getUpcomingHearings);

// GET /api/hearings/case/:caseId - Get hearings for a case
router.get('/case/:caseId', verifyToken, hearingController.getHearingsByCase);

// GET /api/hearings/detail/:id - Get single hearing
router.get('/detail/:id', verifyToken, hearingController.getHearingById);

// PUT /api/hearings/status/:id - Update hearing status
router.put('/status/:id', verifyToken, hearingController.updateHearingStatus);

// PUT /api/hearings/:id - Update hearing (full)
router.put('/:id', verifyToken, hearingController.updateHearing);

// DELETE /api/hearings/:id - Delete hearing
router.delete('/:id', verifyToken, hearingController.deleteHearing);

module.exports = router;
