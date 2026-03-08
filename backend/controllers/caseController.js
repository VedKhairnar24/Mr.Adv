const db = require('../config/db');

/**
 * Create a new case
 * POST /api/cases/create
 */
exports.createCase = (req, res) => {
  const {
    client_id,
    case_title,
    case_number,
    court_name,
    case_type,
    filing_date
  } = req.body;

  // Validate required fields
  if (!client_id || !case_title || !court_name) {
    return res.status(400).json({ 
      message: 'Client ID, case title, and court name are required' 
    });
  }

  // Verify that the client belongs to this advocate
  const checkClientSql = 'SELECT id FROM clients WHERE id = ? AND advocate_id = ?';
  
  db.query(checkClientSql, [client_id, req.advocateId], (err, clientResult) => {
    if (err) {
      console.error('Client verification error:', err);
      return res.status(500).json({ 
        message: 'Failed to verify client',
        error: err.message 
      });
    }

    if (clientResult.length === 0) {
      return res.status(404).json({ 
        message: 'Client not found or does not belong to you' 
      });
    }

    // Insert case into database
    const sql = `
      INSERT INTO cases 
      (client_id, advocate_id, case_title, case_number, court_name, case_type, status, filing_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        client_id,
        req.advocateId,
        case_title,
        case_number,
        court_name,
        case_type,
        'Pending',
        filing_date
      ],
      (err, result) => {
        if (err) {
          console.error('Create case error:', err);
          return res.status(500).json({ 
            message: 'Case creation failed',
            error: err.message 
          });
        }

        res.status(201).json({ 
          message: 'Case created successfully',
          caseId: result.insertId
        });
      }
    );
  });
};

/**
 * Get all cases for the logged-in advocate
 * GET /api/cases/all
 */
exports.getCases = (req, res) => {
  const sql = `
    SELECT cases.*, clients.name AS client_name
    FROM cases
    JOIN clients ON cases.client_id = clients.id
    WHERE cases.advocate_id = ?
    ORDER BY cases.created_at DESC
  `;

  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      console.error('Get cases error:', err);
      return res.status(500).json({ 
        message: 'Error fetching cases',
        error: err.message 
      });
    }

    res.json(result);
  });
};

/**
 * Get single case by ID with full details
 * GET /api/cases/:id
 */
exports.getCaseById = (req, res) => {
  const caseId = req.params.id;

  const sql = `
    SELECT cases.*, clients.name AS client_name, clients.phone AS client_phone, clients.email AS client_email
    FROM cases
    JOIN clients ON cases.client_id = clients.id
    WHERE cases.id = ? AND cases.advocate_id = ?
  `;

  db.query(sql, [caseId, req.advocateId], (err, result) => {
    if (err) {
      console.error('Get case error:', err);
      return res.status(500).json({ 
        message: 'Error fetching case',
        error: err.message 
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found' 
      });
    }

    res.json(result[0]);
  });
};

/**
 * Update case status
 * PUT /api/cases/status/:id
 */
exports.updateCaseStatus = (req, res) => {
  const caseId = req.params.id;
  const { status } = req.body;

  // Validate status
  if (!status) {
    return res.status(400).json({ 
      message: 'Status is required' 
    });
  }

  // Valid status values
  const validStatuses = ['Pending', 'Active', 'On Hold', 'Closed', 'Disposed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  const sql = `
    UPDATE cases
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND advocate_id = ?
  `;

  db.query(sql, [status, caseId, req.advocateId], (err, result) => {
    if (err) {
      console.error('Update status error:', err);
      return res.status(500).json({ 
        message: 'Status update failed',
        error: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Case not found' 
      });
    }

    res.json({ 
      message: 'Case status updated successfully' 
    });
  });
};

/**
 * Update case information
 * PUT /api/cases/:id
 */
exports.updateCase = (req, res) => {
  const caseId = req.params.id;
  const {
    case_title,
    case_number,
    court_name,
    case_type,
    status,
    filing_date
  } = req.body;

  // First verify the case belongs to this advocate
  const checkSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkSql, [caseId, req.advocateId], (err, checkResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error updating case',
        error: err.message 
      });
    }

    if (checkResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found' 
      });
    }

    // Update case data
    const updateSql = `
      UPDATE cases
      SET 
        case_title = ?,
        case_number = ?,
        court_name = ?,
        case_type = ?,
        status = ?,
        filing_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(
      updateSql,
      [
        case_title,
        case_number,
        court_name,
        case_type,
        status,
        filing_date,
        caseId
      ],
      (err, result) => {
        if (err) {
          console.error('Update case error:', err);
          return res.status(500).json({ 
            message: 'Failed to update case',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Case updated successfully' 
        });
      }
    );
  });
};

/**
 * Delete a case
 * DELETE /api/cases/:id
 */
exports.deleteCase = (req, res) => {
  const caseId = req.params.id;

  // First verify the case belongs to this advocate
  const checkSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkSql, [caseId, req.advocateId], (err, checkResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting case',
        error: err.message 
      });
    }

    if (checkResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found' 
      });
    }

    // Delete the case (CASCADE will delete related documents, evidence, hearings, notes)
    const deleteSql = 'DELETE FROM cases WHERE id = ?';

    db.query(deleteSql, [caseId], (err, result) => {
      if (err) {
        console.error('Delete case error:', err);
        return res.status(500).json({ 
          message: 'Failed to delete case',
          error: err.message 
        });
      }

      res.json({ 
        message: 'Case deleted successfully' 
      });
    });
  });
};

/**
 * Search cases by title or case number
 * GET /api/cases/search?q=keyword
 */
exports.searchCases = (req, res) => {
  const keyword = req.query.q;

  // Validate search query
  if (!keyword || keyword.trim().length === 0) {
    return res.status(400).json({ 
      message: 'Search query is required' 
    });
  }

  const sql = `
    SELECT cases.*, clients.name AS client_name
    FROM cases
    JOIN clients ON cases.client_id = clients.id
    WHERE cases.advocate_id = ?
    AND (cases.case_title LIKE ? OR cases.case_number LIKE ? OR clients.name LIKE ?)
    ORDER BY cases.created_at DESC
  `;

  const searchValue = `%${keyword}%`;

  db.query(sql, [req.advocateId, searchValue, searchValue, searchValue], (err, result) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ 
        message: 'Search failed',
        error: err.message 
      });
    }

    res.json(result);
  });
};

/**
 * Filter cases by status
 * GET /api/cases/filter?status=Active
 */
exports.filterCasesByStatus = (req, res) => {
  const status = req.query.status;

  // Validate status
  if (!status) {
    return res.status(400).json({ 
      message: 'Status filter is required' 
    });
  }

  const validStatuses = ['Pending', 'Active', 'On Hold', 'Closed', 'Disposed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  const sql = `
    SELECT cases.*, clients.name AS client_name
    FROM cases
    JOIN clients ON cases.client_id = clients.id
    WHERE cases.advocate_id = ? AND cases.status = ?
    ORDER BY cases.created_at DESC
  `;

  db.query(sql, [req.advocateId, status], (err, result) => {
    if (err) {
      console.error('Filter error:', err);
      return res.status(500).json({ 
        message: 'Failed to filter cases',
        error: err.message 
      });
    }

    res.json(result);
  });
};

/**
 * Get total case count for the logged-in advocate
 * GET /api/cases/count
 */
exports.getCaseCount = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM cases WHERE advocate_id = ?';
  
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      console.error('Get case count error:', err);
      return res.status(500).json({ 
        message: 'Error fetching case count',
        error: err.message 
      });
    }

    res.json({ count: result[0].count });
  });
};
