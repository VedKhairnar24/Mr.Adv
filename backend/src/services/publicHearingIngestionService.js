const db = require('../../config/db');
const logger = require('../config/logger');
const HearingTrackingEngine = require('./hearingTrackingEngine');
const NotificationService = require('./notificationService');

function safeJsonParse(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeDate(d) {
  if (!d) return null;
  // Expect YYYY-MM-DD from cache/mock. If something else, best-effort.
  return String(d).slice(0, 10);
}

function normalizeTime(t) {
  if (!t) return null;
  return String(t).slice(0, 8);
}

function buildExternalKey(cnr, hearing) {
  // Prefer stable upstream id if present; else build deterministic key.
  const upstream = hearing.hearing_id || hearing.id || hearing.hearingId || hearing.listing_id;
  if (upstream) return `${cnr}:${String(upstream)}`;
  const parts = [
    normalizeDate(hearing.hearing_date || hearing.date),
    normalizeTime(hearing.hearing_time || hearing.time) || '',
    (hearing.stage || '').trim(),
    (hearing.court_name || '').trim(),
    (hearing.court_hall || '').trim(),
    (hearing.judge_name || '').trim(),
  ];
  return `${cnr}:${parts.join('|')}`;
}

class PublicHearingIngestionService {
  /**
   * Ingest hearings from latest case_lookup_cache raw_response into hearings table.
   * This is idempotent via (case_id, external_hearing_key) unique index.
   */
  static async ingestFromCache({ cacheId, caseId, advocateId, externalSource = 'ecourts' }) {
    const [cacheRows] = await db.promise.query(
      'SELECT id, cnr_number, case_number, raw_response, synced_at FROM case_lookup_cache WHERE id = ? LIMIT 1',
      [cacheId]
    );
    const cache = cacheRows && cacheRows[0];
    if (!cache) return { ingested: 0, updated: 0, message: 'cache_not_found' };

    const payload = safeJsonParse(cache.raw_response) || {};
    const hearings = Array.isArray(payload.hearings) ? payload.hearings : [];
    const orders = Array.isArray(payload.orders) ? payload.orders : [];

    let ingested = 0;
    let updated = 0;

    // Build quick lookup for "new order before hearing" alerts by date proximity
    const ordersByDate = new Map();
    for (const o of orders) {
      const od = normalizeDate(o.order_date || o.date);
      if (!od) continue;
      if (!ordersByDate.has(od)) ordersByDate.set(od, []);
      ordersByDate.get(od).push(o);
    }

    for (const h of hearings) {
      const hearingDate = normalizeDate(h.hearing_date || h.date);
      if (!hearingDate) continue;

      const hearingTime = normalizeTime(h.hearing_time || h.time);
      const externalKey = buildExternalKey(cache.cnr_number || cache.case_number || 'CASE', h);

      const row = {
        case_id: caseId,
        hearing_date: hearingDate,
        hearing_time: hearingTime,
        court_name: h.court_name || payload.court_name || null,
        court_hall: h.court_hall || null,
        judge_name: h.judge_name || payload.judge_name || null,
        stage: h.stage || null,
        notes: h.notes || h.summary || null,
        next_hearing_date: normalizeDate(h.next_hearing_date) || null,
        status: h.status || 'Scheduled',
        source: 'public',
        external_source: externalSource,
        external_hearing_key: externalKey,
        external_payload: JSON.stringify(h),
        last_synced_at: new Date(cache.synced_at),
        imported_at: new Date(),
      };

      // Upsert and detect if "changed" vs "new"
      const [existingRows] = await db.promise.query(
        'SELECT id, hearing_date, hearing_time, court_name, court_hall, judge_name, stage, status FROM hearings WHERE case_id = ? AND external_hearing_key = ? LIMIT 1',
        [caseId, externalKey]
      );
      const existing = existingRows && existingRows[0];

      if (!existing) {
        await db.promise.query(
          `INSERT INTO hearings
           (case_id, hearing_date, hearing_time, court_name, court_hall, judge_name, stage, notes, next_hearing_date, status,
            source, external_source, external_hearing_key, external_payload, last_synced_at, imported_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.case_id,
            row.hearing_date,
            row.hearing_time,
            row.court_name,
            row.court_hall,
            row.judge_name,
            row.stage,
            row.notes,
            row.next_hearing_date,
            row.status,
            row.source,
            row.external_source,
            row.external_hearing_key,
            row.external_payload,
            row.last_synced_at,
            row.imported_at,
          ]
        );
        ingested += 1;

        // New hearing listing alert (only for future)
        if (advocateId && hearingDate >= normalizeDate(new Date().toISOString())) {
          await NotificationService.createNotification({
            user_id: advocateId,
            type: 'system_alert',
            title: 'New hearing listed',
            message: `A new hearing has been listed on ${hearingDate}${hearingTime ? ` at ${hearingTime.slice(0, 5)}` : ''} for case ${cache.case_number || cache.cnr_number || ''}.`,
            related_type: 'case',
            related_id: caseId,
            priority: (h.listing_type || '').toLowerCase() === 'urgent' ? 'urgent' : 'high',
          });
        }
      } else {
        const changed =
          String(existing.hearing_date).slice(0, 10) !== row.hearing_date ||
          normalizeTime(existing.hearing_time) !== row.hearing_time ||
          (existing.court_name || '') !== (row.court_name || '') ||
          (existing.court_hall || '') !== (row.court_hall || '') ||
          (existing.judge_name || '') !== (row.judge_name || '') ||
          (existing.stage || '') !== (row.stage || '') ||
          (existing.status || '') !== (row.status || '');

        await db.promise.query(
          `UPDATE hearings SET
             hearing_date = ?,
             hearing_time = ?,
             court_name = ?,
             court_hall = ?,
             judge_name = ?,
             stage = ?,
             notes = COALESCE(?, notes),
             next_hearing_date = ?,
             status = ?,
             source = 'public',
             external_source = ?,
             external_payload = ?,
             last_synced_at = ?
           WHERE id = ?`,
          [
            row.hearing_date,
            row.hearing_time,
            row.court_name,
            row.court_hall,
            row.judge_name,
            row.stage,
            row.notes,
            row.next_hearing_date,
            row.status,
            row.external_source,
            row.external_payload,
            row.last_synced_at,
            existing.id,
          ]
        );

        if (changed) {
          updated += 1;
          await NotificationService.createNotification({
            user_id: advocateId,
            type: 'system_alert',
            title: 'Hearing rescheduled/updated',
            message: `Hearing updated to ${hearingDate}${hearingTime ? ` ${hearingTime.slice(0, 5)}` : ''} for case ${cache.case_number || cache.cnr_number || ''}.`,
            related_type: 'hearing',
            related_id: existing.id,
            priority: (h.listing_type || '').toLowerCase() === 'urgent' ? 'urgent' : 'high',
          });
        }
      }

      // New order before hearing alert (if order on same date as latest sync)
      const orderList = ordersByDate.get(normalizeDate(new Date(cache.synced_at).toISOString())) || [];
      if (orderList.length > 0 && advocateId) {
        const [already] = await db.promise.query(
          `SELECT id FROM notifications
           WHERE user_id = ?
             AND type = 'system_alert'
             AND related_type = 'case'
             AND related_id = ?
             AND created_at > DATE_SUB(NOW(), INTERVAL 12 HOUR)
           LIMIT 1`,
          [advocateId, caseId]
        );
        if (!already || already.length === 0) {
          const snippet = (orderList[0].summary || 'New order/update available').slice(0, 180);
          await NotificationService.createNotification({
            user_id: advocateId,
            type: 'system_alert',
            title: 'New order/update before hearing',
            message: `${snippet}${snippet.length >= 180 ? '...' : ''}`,
            related_type: 'case',
            related_id: caseId,
            priority: 'high',
          });
        }
      }
    }

    // Update derived next-hearing state after ingestion
    try {
      await HearingTrackingEngine.syncNextHearingForCase(caseId);
    } catch (e) {
      logger.warn('PublicHearingIngestionService: syncNextHearingForCase failed', { caseId, error: e.message });
    }

    return { ingested, updated, hearings_in_payload: hearings.length };
  }
}

module.exports = PublicHearingIngestionService;

