const db = require('../../config/db');
const PublicHearingSyncEngine = require('../services/publicHearingSyncEngine');
const logger = require('../config/logger');

/**
 * GET /api/hearings/sync/status/:caseId
 * Return last sync time + counts for a case
 */
exports.getCaseSyncStatus = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const advocateId = req.advocateId;

    const [rows] = await db.promise.query(
      `SELECT id, last_synced_at, cnr_number, case_number
       FROM cases
       WHERE id = ? AND advocate_id = ? AND is_external_case = TRUE
       LIMIT 1`,
      [caseId, advocateId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const [counts] = await db.promise.query(
      `SELECT
         SUM(source = 'public') AS public_hearings,
         SUM(source = 'manual') AS manual_hearings
       FROM hearings
       WHERE case_id = ?`,
      [caseId]
    );

    res.json({
      success: true,
      data: {
        case_id: rows[0].id,
        cnr_number: rows[0].cnr_number,
        case_number: rows[0].case_number,
        last_synced_at: rows[0].last_synced_at,
        public_hearings: counts?.[0]?.public_hearings || 0,
        manual_hearings: counts?.[0]?.manual_hearings || 0,
      },
    });
  } catch (e) {
    logger.error('getCaseSyncStatus error', { error: e.message });
    res.status(500).json({ success: false, message: 'Failed to fetch sync status' });
  }
};

/**
 * POST /api/hearings/sync/trigger/:caseId
 * Trigger a sync now for a case (still automatic ingestion, not manual entry).
 */
exports.triggerCaseSync = async (req, res) => {
  try {
    const caseId = req.params.caseId;

    // Ownership validation is inside sync engine query as well
    // but here we keep it explicit.
    const [rows] = await db.promise.query(
      `SELECT id FROM cases WHERE id = ? AND advocate_id = ? AND is_external_case = TRUE LIMIT 1`,
      [caseId, req.advocateId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const result = await PublicHearingSyncEngine.syncCase(caseId);
    res.json({ success: true, message: 'Sync completed', data: result });
  } catch (e) {
    logger.error('triggerCaseSync error', { error: e.message });
    res.status(500).json({ success: false, message: e.message || 'Sync failed' });
  }
};

