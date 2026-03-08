const db = require('../config/db');

/**
 * Add a note to a case
 * POST /api/notes/add
 */
exports.addNote = (req, res) => {
  const { case_id, note_text } = req.body;

  // Validate required fields
  if (!case_id) {
    return res.status(400).json({ 
      message: 'Case ID is required' 
    });
  }

  if (!note_text) {
    return res.status(400).json({ 
      message: 'Note text is required' 
    });
  }

  // Verify that the case belongs to this advocate
  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
    if (err) {
      console.error('Case verification error:', err);
      return res.status(500).json({ 
        message: 'Failed to verify case',
        error: err.message 
      });
    }

    if (caseResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found or does not belong to you' 
      });
    }

    // Insert note into database
    const sql = 'INSERT INTO notes (case_id, note_text) VALUES (?, ?)';

    db.query(sql, [case_id, note_text], (err, result) => {
      if (err) {
        console.error('Add note error:', err);
        return res.status(500).json({ 
          message: 'Note creation failed',
          error: err.message 
        });
      }

      res.status(201).json({ 
        message: 'Note added successfully',
        noteId: result.insertId
      });
    });
  });
};

/**
 * Get all notes for a specific case
 * GET /api/notes/:caseId
 */
exports.getNotes = (req, res) => {
  const caseId = req.params.caseId;

  // Verify that the case belongs to this advocate
  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkCaseSql, [caseId, req.advocateId], (err, caseResult) => {
    if (err) {
      console.error('Case verification error:', err);
      return res.status(500).json({ 
        message: 'Failed to verify case',
        error: err.message 
      });
    }

    if (caseResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found or does not belong to you' 
      });
    }

    // Fetch notes for the case
    const sql = 'SELECT * FROM notes WHERE case_id = ? ORDER BY created_at DESC';

    db.query(sql, [caseId], (err, result) => {
      if (err) {
        console.error('Get notes error:', err);
        return res.status(500).json({ 
          message: 'Error fetching notes',
          error: err.message 
        });
      }

      res.json(result);
    });
  });
};

/**
 * Update a note
 * PUT /api/notes/:id
 */
exports.updateNote = (req, res) => {
  const noteId = req.params.id;
  const { note_text } = req.body;

  // First verify the note exists and get case_id
  const checkSql = 'SELECT * FROM notes WHERE id = ?';
  
  db.query(checkSql, [noteId], (err, noteResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error updating note',
        error: err.message 
      });
    }

    if (noteResult.length === 0) {
      return res.status(404).json({ 
        message: 'Note not found' 
      });
    }

    const note = noteResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [note.case_id, req.advocateId], (err, caseResult) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error verifying case',
          error: err.message 
        });
      }

      if (caseResult.length === 0) {
        return res.status(404).json({ 
          message: 'Case not found or does not belong to you' 
        });
      }

      // Update the note
      const updateSql = 'UPDATE notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      db.query(updateSql, [note_text, noteId], (err, result) => {
        if (err) {
          console.error('Update note error:', err);
          return res.status(500).json({ 
            message: 'Failed to update note',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Note updated successfully' 
        });
      });
    });
  });
};

/**
 * Delete a note
 * DELETE /api/notes/:id
 */
exports.deleteNote = (req, res) => {
  const noteId = req.params.id;

  // First verify the note exists and get case_id
  const checkSql = 'SELECT * FROM notes WHERE id = ?';
  
  db.query(checkSql, [noteId], (err, noteResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting note',
        error: err.message 
      });
    }

    if (noteResult.length === 0) {
      return res.status(404).json({ 
        message: 'Note not found' 
      });
    }

    const note = noteResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [note.case_id, req.advocateId], (err, caseResult) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error verifying case',
          error: err.message 
        });
      }

      if (caseResult.length === 0) {
        return res.status(404).json({ 
          message: 'Case not found or does not belong to you' 
        });
      }

      // Delete the note
      const deleteSql = 'DELETE FROM notes WHERE id = ?';

      db.query(deleteSql, [noteId], (err, result) => {
        if (err) {
          console.error('Delete note error:', err);
          return res.status(500).json({ 
            message: 'Failed to delete note',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Note deleted successfully' 
        });
      });
    });
  });
};
