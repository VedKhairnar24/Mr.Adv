const db = require('../../config/db');
const logger = require('../config/logger');
const caseLookupService = require('../../services/caseLookupService');
const PublicHearingIngestionService = require('./publicHearingIngestionService');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class PublicHearingSyncEngine {
  /**
   * Sync hearings for all external cases (polling).
   * - refreshes public payload (cache) via CaseLookupService
   * - ingests hearings into local hearings table
   */
  static async syncAllExternalCases({ limit = 1000, delayMs = 150 } = {}) {
    const [cases] = await db.promise.query(
      `SELECT id, advocate_id, cnr_number, case_number, court_name
       FROM cases
       WHERE is_external_case = TRUE
         AND (cnr_number IS NOT NULL OR case_number IS NOT NULL)
       ORDER BY COALESCE(last_synced_at, created_at) ASC
       LIMIT ?`,
      [limit]
    );

    logger.info(`PublicHearingSyncEngine: syncing hearings for ${cases.length} external cases`);

    const results = [];
    for (const c of cases) {
      try {
        const fresh = c.cnr_number
          ? await caseLookupService.searchByCNR(String(c.cnr_number).toUpperCase().trim())
          : await caseLookupService.searchByCaseNumber(String(c.case_number).trim(), c.court_name || '');

        // Ingestion uses cache_id produced by searchBy*()
        const cacheId = fresh.cache_id;
        if (!cacheId) throw new Error('Missing cache_id from case lookup');

        const ingest = await PublicHearingIngestionService.ingestFromCache({
          cacheId,
          caseId: c.id,
          advocateId: c.advocate_id,
          externalSource: 'ecourts',
        });

        // mark last_synced_at on case
        await db.promise.query(
          `UPDATE cases SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [c.id]
        );

        results.push({ case_id: c.id, cache_id: cacheId, ...ingest, status: 'ok' });
      } catch (e) {
        logger.warn('PublicHearingSyncEngine: sync failed', { caseId: c.id, error: e.message });
        results.push({ case_id: c.id, status: 'error', error: e.message });
      }

      if (delayMs) await sleep(delayMs);
    }

    return results;
  }

  static async syncCase(caseId) {
    const [rows] = await db.promise.query(
      `SELECT id, advocate_id, cnr_number, case_number, court_name
       FROM cases
       WHERE id = ? AND is_external_case = TRUE
       LIMIT 1`,
      [caseId]
    );
    const c = rows && rows[0];
    if (!c) throw new Error('External case not found');

    const fresh = c.cnr_number
      ? await caseLookupService.searchByCNR(String(c.cnr_number).toUpperCase().trim())
      : await caseLookupService.searchByCaseNumber(String(c.case_number).trim(), c.court_name || '');

    const cacheId = fresh.cache_id;
    if (!cacheId) throw new Error('Missing cache_id from case lookup');

    const ingest = await PublicHearingIngestionService.ingestFromCache({
      cacheId,
      caseId: c.id,
      advocateId: c.advocate_id,
      externalSource: 'ecourts',
    });

    await db.promise.query(
      `UPDATE cases SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [c.id]
    );

    return { case_id: c.id, cache_id: cacheId, ...ingest };
  }
}

module.exports = PublicHearingSyncEngine;

