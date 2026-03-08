const db = require('../config/db');

/**
 * Add a hearing to a case
 * POST /api/hearings/add
 */
exports.addHearing = (req, res) => {
  const { case_id, hearing_date, court_hall, judge_name, notes, hearing_time } = req.body;

  // Validate required fields
  if (!case_id) {
    return res.status(400).json({ 
      message: 'Case ID is required' 
    });
  }

  if (!hearing_date) {
    return res.status(400).json({ 
      message: 'Hearing date is required' 
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

    // Insert hearing into database
    const sql = 'INSERT INTO hearings (case_id, hearing_date, court_hall, judge_name, notes, hearing_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(
      sql,
      [case_id, hearing_date, court_hall || null, judge_name || null, notes || null, hearing_time || null, 'Scheduled'],
      (err, result) => {
        if (err) {
          console.error('Add hearing error:', err);
          return res.status(500).json({ 
            message: 'Hearing creation failed',
            error: err.message 
          });
        }

        res.status(201).json({ 
          message: 'Hearing added successfully',
          hearingId: result.insertId
        });
      }
    );
  });
};

/**
 * Get all hearings for a specific case
 * GET /api/hearings/:caseId
 */
exports.getHearings = (req, res) => {
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

    // Fetch hearings for the case
    const sql = 'SELECT * FROM hearings WHERE case_id = ? ORDER BY hearing_date ASC, hearing_time ASC';

    db.query(sql, [caseId], (err, result) => {
      if (err) {
        console.error('Get hearings error:', err);
        return res.status(500).json({ 
          message: 'Error fetching hearings',
          error: err.message 
        });
      }

      res.json(result);
    });
  });
};

/**
 * Update hearing status
 * PUT /api/hearings/status/:id
 */
exports.updateHearingStatus = (req, res) => {
  const hearingId = req.params.id;
  const { status } = req.body;

  // Valid status values
  const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Adjourned'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  // First verify the hearing exists and get case_id
  const checkSql = 'SELECT * FROM hearings WHERE id = ?';
  
  db.query(checkSql, [hearingId], (err, hearingResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error updating hearing',
        error: err.message 
      });
    }

    if (hearingResult.length === 0) {
      return res.status(404).json({ 
        message: 'Hearing not found' 
      });
    }

    const hearing = hearingResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [hearing.case_id, req.advocateId], (err, caseResult) => {
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

      // Update hearing status
      const updateSql = 'UPDATE hearings SET status = ? WHERE id = ?';

      db.query(updateSql, [status, hearingId], (err, result) => {
        if (err) {
          console.error('Update status error:', err);
          return res.status(500).json({ 
            message: 'Failed to update hearing status',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Hearing status updated successfully' 
        });
      });
    });
  });
};

/**
 * Delete a hearing
 * DELETE /api/hearings/:id
 */
exports.deleteHearing = (req, res) => {
  const hearingId = req.params.id;

  // First verify the hearing exists and get case_id
  const checkSql = 'SELECT * FROM hearings WHERE id = ?';
  
  db.query(checkSql, [hearingId], (err, hearingResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting hearing',
        error: err.message 
      });
    }

    if (hearingResult.length === 0) {
      return res.status(404).json({ 
        message: 'Hearing not found' 
      });
    }

    const hearing = hearingResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [hearing.case_id, req.advocateId], (err, caseResult) => {
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

      // Delete the hearing
      const deleteSql = 'DELETE FROM hearings WHERE id = ?';

      db.query(deleteSql, [hearingId], (err, result) => {
        if (err) {
          console.error('Delete hearing error:', err);
          return res.status(500).json({ 
            message: 'Failed to delete hearing',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Hearing deleted successfully' 
        });
      });
    });
  });
};

/**
 * Get upcoming hearings for dashboard
 * GET /api/hearings/upcoming
 */
exports.getUpcomingHearings = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const sql = `
      SELECT 
        h.*,
        cs.case_title,
        cs.case_number,
        cl.name AS client_name,
        cl.phone AS client_phone,
        cl.email AS client_email
      FROM hearings h
      JOIN cases cs ON h.case_id = cs.id
      JOIN clients cl ON cs.client_id = cl.id
      WHERE h.case_id IN (SELECT id FROM cases WHERE advocate_id = ?)
      AND h.hearing_date >= ?
      AND h.status != 'Cancelled'
      AND h.status != 'Completed'
      ORDER BY h.hearing_date ASC, h.hearing_time ASC
      LIMIT 10
    `;

    db.query(sql, [req.advocateId, today], (err, result) => {
      if (err) {
        console.error('Get upcoming hearings error:', err);
        return res.status(500).json({ 
          message: 'Error fetching upcoming hearings',
          error: err.message 
        });
      }

      res.json(result);
    });
  } catch (error) {
    console.error('Get upcoming hearings error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
