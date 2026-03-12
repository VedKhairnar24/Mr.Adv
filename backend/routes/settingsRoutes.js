const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

router.get('/profile', verifyToken, settingsController.getProfile);
router.put('/profile', verifyToken, settingsController.updateProfile);
router.put('/change-password', verifyToken, settingsController.changePassword);

module.exports = router;
