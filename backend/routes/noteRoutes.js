const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const noteController = require('../controllers/noteController');

// New case_notes endpoints
router.post('/', verifyToken, noteController.createNote);
router.get('/', verifyToken, noteController.getAllNotes);
router.get('/case/:caseId', verifyToken, noteController.getNotesByCase);
router.get('/:id', verifyToken, noteController.getNoteById);
router.put('/:id', verifyToken, noteController.updateNote);
router.delete('/:id', verifyToken, noteController.deleteNote);

// Legacy endpoints (backward compatibility with old notes table)
router.post('/add', verifyToken, noteController.addNote);
router.get('/legacy/:caseId', verifyToken, noteController.getLegacyNotes);

module.exports = router;
