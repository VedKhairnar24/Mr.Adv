const db = require('../config/db');

const NOTE_TYPES = ['Client Meeting', 'Court Observation', 'Legal Research', 'Strategy Note', 'Task', 'General'];

/**
 * Create a new case note
 * POST /api/notes
 */
exports.createNote = (req, res) => {
  const { case_id, note_type, title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  if (note_type && !NOTE_TYPES.includes(note_type)) {
    return res.status(400).json({ message: 'Invalid note type' });
  }

  const proceed = () => {
    const sql = 'INSERT INTO case_notes (case_id, advocate_id, note_type, title, content, author) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [case_id || null, req.advocateId, note_type || 'General', title, content, author || 'Advocate'], (err, result) => {
      if (err) {
        console.error('Create note error:', err);
        return res.status(500).json({ message: 'Note creation failed', error: err.message });
      }
      res.status(201).json({ message: 'Note created successfully', noteId: result.insertId });
    });
  };

  if (case_id) {
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
      if (err) return res.status(500).json({ message: 'Failed to verify case', error: err.message });
      if (caseResult.length === 0) return res.status(404).json({ message: 'Case not found or does not belong to you' });
      proceed();
    });
  } else {
    proceed();
  }
};

/**
 * Get all notes for the advocate (global)
 * GET /api/notes
 */
exports.getAllNotes = (req, res) => {
  const { search, note_type } = req.query;

  let sql = `SELECT cn.*, c.case_title 
             FROM case_notes cn 
             LEFT JOIN cases c ON cn.case_id = c.id 
             WHERE cn.advocate_id = ?`;
  const params = [req.advocateId];

  if (search) {
    sql += ' AND (cn.title LIKE ? OR cn.content LIKE ? OR c.case_title LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (note_type) {
    sql += ' AND cn.note_type = ?';
    params.push(note_type);
  }

  sql += ' ORDER BY cn.updated_at DESC';

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Get all notes error:', err);
      return res.status(500).json({ message: 'Error fetching notes', error: err.message });
    }
    res.json(result);
  });
};

/**
 * Get notes by case ID
 * GET /api/notes/case/:caseId
 */
exports.getNotesByCase = (req, res) => {
  const caseId = req.params.caseId;

  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  db.query(checkCaseSql, [caseId, req.advocateId], (err, caseResult) => {
    if (err) return res.status(500).json({ message: 'Failed to verify case', error: err.message });
    if (caseResult.length === 0) return res.status(404).json({ message: 'Case not found or does not belong to you' });

    const sql = `SELECT cn.*, c.case_title 
                 FROM case_notes cn 
                 LEFT JOIN cases c ON cn.case_id = c.id 
                 WHERE cn.case_id = ? AND cn.advocate_id = ? 
                 ORDER BY cn.updated_at DESC`;
    db.query(sql, [caseId, req.advocateId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error fetching notes', error: err.message });
      res.json(result);
    });
  });
};

/**
 * Get a single note by ID
 * GET /api/notes/:id
 */
exports.getNoteById = (req, res) => {
  const noteId = req.params.id;

  const sql = `SELECT cn.*, c.case_title 
               FROM case_notes cn 
               LEFT JOIN cases c ON cn.case_id = c.id 
               WHERE cn.id = ? AND cn.advocate_id = ?`;
  db.query(sql, [noteId, req.advocateId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching note', error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Note not found' });
    res.json(result[0]);
  });
};

/**
 * Update a note
 * PUT /api/notes/:id
 */
exports.updateNote = (req, res) => {
  const noteId = req.params.id;
  const { case_id, note_type, title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  if (note_type && !NOTE_TYPES.includes(note_type)) {
    return res.status(400).json({ message: 'Invalid note type' });
  }

  const checkSql = 'SELECT id FROM case_notes WHERE id = ? AND advocate_id = ?';
  db.query(checkSql, [noteId, req.advocateId], (err, noteResult) => {
    if (err) return res.status(500).json({ message: 'Error verifying note', error: err.message });
    if (noteResult.length === 0) return res.status(404).json({ message: 'Note not found' });

    const proceed = () => {
      const updateSql = 'UPDATE case_notes SET case_id = ?, note_type = ?, title = ?, content = ?, author = ? WHERE id = ? AND advocate_id = ?';
      db.query(updateSql, [case_id || null, note_type || 'General', title, content, author || 'Advocate', noteId, req.advocateId], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update note', error: err.message });
        res.json({ message: 'Note updated successfully' });
      });
    };

    if (case_id) {
      const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
      db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
        if (err) return res.status(500).json({ message: 'Failed to verify case', error: err.message });
        if (caseResult.length === 0) return res.status(404).json({ message: 'Case not found or does not belong to you' });
        proceed();
      });
    } else {
      proceed();
    }
  });
};

/**
 * Delete a note
 * DELETE /api/notes/:id
 */
exports.deleteNote = (req, res) => {
  const noteId = req.params.id;

  const checkSql = 'SELECT id FROM case_notes WHERE id = ? AND advocate_id = ?';
  db.query(checkSql, [noteId, req.advocateId], (err, noteResult) => {
    if (err) return res.status(500).json({ message: 'Error deleting note', error: err.message });
    if (noteResult.length === 0) return res.status(404).json({ message: 'Note not found' });

    const deleteSql = 'DELETE FROM case_notes WHERE id = ? AND advocate_id = ?';
    db.query(deleteSql, [noteId, req.advocateId], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to delete note', error: err.message });
      res.json({ message: 'Note deleted successfully' });
    });
  });
};

/**
 * Legacy: Add a simple note to a case (backward compatibility)
 * POST /api/notes/add
 */
exports.addNote = (req, res) => {
  const { case_id, note_text } = req.body;

  if (!case_id) {
    return res.status(400).json({ message: 'Case ID is required' });
  }
  if (!note_text) {
    return res.status(400).json({ message: 'Note text is required' });
  }

  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
    if (err) return res.status(500).json({ message: 'Failed to verify case', error: err.message });
    if (caseResult.length === 0) return res.status(404).json({ message: 'Case not found or does not belong to you' });

    const sql = 'INSERT INTO notes (case_id, note_text) VALUES (?, ?)';
    db.query(sql, [case_id, note_text], (err, result) => {
      if (err) return res.status(500).json({ message: 'Note creation failed', error: err.message });
      res.status(201).json({ message: 'Note added successfully', noteId: result.insertId });
    });
  });
};

/**
 * Legacy: Get all notes for a specific case (from old notes table)
 * GET /api/notes/legacy/:caseId
 */
exports.getLegacyNotes = (req, res) => {
  const caseId = req.params.caseId;

  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  db.query(checkCaseSql, [caseId, req.advocateId], (err, caseResult) => {
    if (err) return res.status(500).json({ message: 'Failed to verify case', error: err.message });
    if (caseResult.length === 0) return res.status(404).json({ message: 'Case not found or does not belong to you' });

    const sql = 'SELECT * FROM notes WHERE case_id = ? ORDER BY created_at DESC';
    db.query(sql, [caseId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error fetching notes', error: err.message });
      res.json(result);
    });
  });
};
