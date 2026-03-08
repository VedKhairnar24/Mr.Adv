const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const clientController = require('../controllers/clientController');

/**
 * @route   POST /api/clients/create
 * @desc    Create a new client (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post('/create', verifyToken, clientController.createClient);

/**
 * @route   GET /api/clients/all
 * @desc    Get all clients for logged-in advocate (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/all', verifyToken, clientController.getClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client by ID (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:id', verifyToken, clientController.getClientById);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client information (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/:id', verifyToken, clientController.updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, clientController.deleteClient);

/**
 * @route   GET /api/clients/count
 * @desc    Get total client count (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/count', verifyToken, clientController.getClientCount);

module.exports = router;
