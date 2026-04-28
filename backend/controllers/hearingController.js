const db = require('../config/db');
// HearingTrackingEngine intentionally not used here: manual write endpoints disabled.

/**
 * Add a hearing to a case
 * POST /api/hearings/add
 */
exports.addHearing = (req, res) => {
  // Manual hearing entry is disabled. Hearings are ingested from public judicial data.
  return res.status(403).json({
    message: 'Manual hearing entry is disabled. Hearings are auto-synced from public case data.',
  });
  // const { case_id, hearing_date, hearing_time, court_name, court_hall, judge_name, stage, notes, next_hearing_date } = req.body;

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
  return res.status(403).json({
    message: 'Manual hearing updates are disabled. Hearings are managed via public-data sync.',
  });
};

/**
 * Update hearing status only
 * PUT /api/hearings/status/:id
 */
exports.updateHearingStatus = (req, res) => {
  return res.status(403).json({
    message: 'Manual hearing status updates are disabled. Hearings are managed via public-data sync.',
  });
};

/**
 * Delete a hearing
 * DELETE /api/hearings/:id
 */
exports.deleteHearing = (req, res) => {
  return res.status(403).json({
    message: 'Manual hearing deletion is disabled. Hearings are managed via public-data sync.',
  });
};
