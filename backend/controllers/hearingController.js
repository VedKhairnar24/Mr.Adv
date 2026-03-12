const db = require('../config/db');

/**
 * Add a hearing to a case
 * POST /api/hearings/add
 */
exports.addHearing = (req, res) => {
  const { case_id, hearing_date, hearing_time, court_name, court_hall, judge_name, stage, notes, next_hearing_date } = req.body;

  if (!case_id) {
    return res.status(400).json({ message: 'Case ID is required' });
  }
  if (!hearing_date) {
    return res.status(400).json({ message: 'Hearing date is required' });
  }

  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
    if (err) {
      console.error('Case verification error:', err);
      return res.status(500).json({ message: 'Failed to verify case', error: err.message });
    }
    if (caseResult.length === 0) {
      return res.status(404).json({ message: 'Case not found or does not belong to you' });
    }

    const sql = `INSERT INTO hearings (case_id, hearing_date, hearing_time, court_name, court_hall, judge_name, stage, notes, next_hearing_date, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
      case_id, hearing_date, hearing_time || null, court_name || null, court_hall || null,
      judge_name || null, stage || null, notes || null, next_hearing_date || null, 'Scheduled'
    ], (err, result) => {
      if (err) {
        console.error('Add hearing error:', err);
        return res.status(500).json({ message: 'Hearing creation failed', error: err.message });
      }
      res.status(201).json({ message: 'Hearing added successfully', hearingId: result.insertId });
    });
  });
};

/**
 * Get all hearings for a specific case
 * GET /api/hearings/case/:caseId
 */
exports.getHearingsByCase = (req, res) => {
  const caseId = req.params.caseId;
  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';

  db.query(checkCaseSql, [caseId, req.advocateId], (err, caseResult) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to verify case', error: err.message });
    }
    if (caseResult.length === 0) {
      return res.status(404).json({ message: 'Case not found or does not belong to you' });
    }

    const sql = 'SELECT * FROM hearings WHERE case_id = ? ORDER BY hearing_date ASC, hearing_time ASC';
    db.query(sql, [caseId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching hearings', error: err.message });
      }
      res.json(result);
    });
  });
};

/**
 * Get ALL hearings for the logged-in advocate (all cases)
 * GET /api/hearings/all
 */
exports.getAllHearings = (req, res) => {
  const sql = `
    SELECT h.*, c.case_title, c.case_number, cl.name AS client_name
    FROM hearings h
    JOIN cases c ON h.case_id = c.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE c.advocate_id = ?
    ORDER BY h.hearing_date DESC, h.hearing_time ASC
  `;
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching hearings', error: err.message });
    }
    res.json(result);
  });
};

/**
 * Get a single hearing by ID
 * GET /api/hearings/detail/:id
 */
exports.getHearingById = (req, res) => {
  const sql = `
    SELECT h.*, c.case_title, c.case_number, c.court_name AS case_court, cl.name AS client_name
    FROM hearings h
    JOIN cases c ON h.case_id = c.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE h.id = ? AND c.advocate_id = ?
  `;
  db.query(sql, [req.params.id, req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching hearing', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Hearing not found' });
    }
    res.json(result[0]);
  });
};

/**
 * Get upcoming hearings for dashboard
 * GET /api/hearings/upcoming
 */
exports.getUpcomingHearings = (req, res) => {
  const sql = `
    SELECT h.*, c.case_title, c.case_number, cl.name AS client_name
    FROM hearings h
    JOIN cases c ON h.case_id = c.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE c.advocate_id = ?
      AND h.hearing_date >= CURDATE()
      AND h.status NOT IN ('Cancelled', 'Completed')
    ORDER BY h.hearing_date ASC, h.hearing_time ASC
    LIMIT 10
  `;
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching upcoming hearings', error: err.message });
    }
    res.json(result);
  });
};

/**
 * Update a hearing (full update)
 * PUT /api/hearings/:id
 */
exports.updateHearing = (req, res) => {
  const hearingId = req.params.id;
  const { hearing_date, hearing_time, court_name, court_hall, judge_name, stage, notes, next_hearing_date, status } = req.body;

  const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Adjourned'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const checkSql = `
    SELECT h.id FROM hearings h
    JOIN cases c ON h.case_id = c.id
    WHERE h.id = ? AND c.advocate_id = ?
  `;
  db.query(checkSql, [hearingId, req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying hearing', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Hearing not found or does not belong to you' });
    }

    const updateSql = `UPDATE hearings SET
      hearing_date = COALESCE(?, hearing_date),
      hearing_time = COALESCE(?, hearing_time),
      court_name = COALESCE(?, court_name),
      court_hall = COALESCE(?, court_hall),
      judge_name = COALESCE(?, judge_name),
      stage = COALESCE(?, stage),
      notes = COALESCE(?, notes),
      next_hearing_date = ?,
      status = COALESCE(?, status)
      WHERE id = ?`;

    db.query(updateSql, [
      hearing_date || null, hearing_time || null, court_name || null, court_hall || null,
      judge_name || null, stage || null, notes || null, next_hearing_date || null,
      status || null, hearingId
    ], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update hearing', error: err.message });
      }
      res.json({ message: 'Hearing updated successfully' });
    });
  });
};

/**
 * Update hearing status only
 * PUT /api/hearings/status/:id
 */
exports.updateHearingStatus = (req, res) => {
  const hearingId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Adjourned'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const checkSql = `
    SELECT h.id FROM hearings h
    JOIN cases c ON h.case_id = c.id
    WHERE h.id = ? AND c.advocate_id = ?
  `;
  db.query(checkSql, [hearingId, req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying hearing', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Hearing not found or does not belong to you' });
    }

    db.query('UPDATE hearings SET status = ? WHERE id = ?', [status, hearingId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update hearing status', error: err.message });
      }
      res.json({ message: 'Hearing status updated successfully' });
    });
  });
};

/**
 * Delete a hearing
 * DELETE /api/hearings/:id
 */
exports.deleteHearing = (req, res) => {
  const hearingId = req.params.id;

  const checkSql = `
    SELECT h.id FROM hearings h
    JOIN cases c ON h.case_id = c.id
    WHERE h.id = ? AND c.advocate_id = ?
  `;
  db.query(checkSql, [hearingId, req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying hearing', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Hearing not found or does not belong to you' });
    }

    db.query('DELETE FROM hearings WHERE id = ?', [hearingId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to delete hearing', error: err.message });
      }
      res.json({ message: 'Hearing deleted successfully' });
    });
  });
};
