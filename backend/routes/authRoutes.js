const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new advocate
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login advocate and return JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current advocate profile (Protected route)
 * @access  Private
 */
router.get('/profile', authController.getProfile);

module.exports = router;
