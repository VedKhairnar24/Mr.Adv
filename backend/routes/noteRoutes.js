const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const noteController = require('../controllers/noteController');

/**
 * @route   POST /api/notes/add
 * @desc    Add a note to a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.post('/add', verifyToken, noteController.addNote);

/**
 * @route   GET /api/notes/:caseId
 * @desc    Get all notes for a case (Protected route)
 * @access  Private (Requires JWT token)
 */
router.get('/:caseId', verifyToken, noteController.getNotes);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note (Protected route)
 * @access  Private (Requires JWT token)
 */
router.put('/:id', verifyToken, noteController.updateNote);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note (Protected route)
 * @access  Private (Requires JWT token)
 */
router.delete('/:id', verifyToken, noteController.deleteNote);

module.exports = router;
