const db = require('../config/db');

/**
 * Get all courts for advocate
 * GET /api/courts
 */
exports.getCourts = (req, res) => {
  const sql = 'SELECT * FROM courts WHERE advocate_id = ? ORDER BY court_name ASC';
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching courts', error: err.message });
    }
    res.json(result);
  });
};

/**
 * Add a court
 * POST /api/courts
 */
exports.addCourt = (req, res) => {
  const { court_name, location } = req.body;
  if (!court_name) {
    return res.status(400).json({ message: 'Court name is required' });
  }

  const sql = 'INSERT INTO courts (advocate_id, court_name, location) VALUES (?, ?, ?)';
  db.query(sql, [req.advocateId, court_name, location || null], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error adding court', error: err.message });
    }
    res.status(201).json({ message: 'Court added successfully', courtId: result.insertId });
  });
};

/**
 * Delete a court
 * DELETE /api/courts/:id
 */
exports.deleteCourt = (req, res) => {
  const sql = 'DELETE FROM courts WHERE id = ? AND advocate_id = ?';
  db.query(sql, [req.params.id, req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting court', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json({ message: 'Court deleted successfully' });
  });
};
