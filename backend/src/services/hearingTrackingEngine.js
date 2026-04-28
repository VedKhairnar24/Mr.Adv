const crypto = require('crypto');
const db = require('../../config/db');
const NotificationService = require('./notificationService');
const logger = require('../config/logger');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function normalizeTime(t) {
  if (!t) return null;
  // mysql2 may return TIME as string "HH:MM:SS"
  if (typeof t === 'string') return t.slice(0, 8);
  return String(t);
}

function scheduleFingerprint(h) {
  // Only include fields that constitute a "schedule" change.
  // Notes are intentionally excluded to avoid noisy "change" alerts.
  const parts = [
    h.hearing_date ? String(h.hearing_date).slice(0, 10) : '',
    normalizeTime(h.hearing_time) || '',
    h.court_name || '',
    h.court_hall || '',
    h.judge_name || '',
    h.stage || '',
    h.status || '',
  ];
  return sha256Hex(parts.join('|'));
}

class HearingTrackingEngine {
  /**
   * Recompute next hearing state for all cases and detect schedule changes.
   * Intended to run daily (and can be safely re-run).
   */
  static async runDailyCaseMonitoring() {
    logger.info('HearingTrackingEngine: daily case monitoring started');
    await this.syncNextHearingsForAllCases();
    await this.detectScheduleChangesForUpcomingHearings();
    await this.markTomorrowFlags();
    logger.info('HearingTrackingEngine: daily case monitoring finished');
  }

  /**
   * Sync case_hearing_state for all cases (derived from hearings table).
   */
  static async syncNextHearingsForAllCases() {
    const query = `
      SELECT
        c.id AS case_id,
        c.advocate_id,
        nh.id AS next_hearing_id,
        nh.hearing_date AS next_hearing_date,
        nh.hearing_time AS next_hearing_time
      FROM cases c
      LEFT JOIN (
        SELECT h1.*
        FROM hearings h1
        JOIN (
          SELECT
            h.case_id,
            MIN(CONCAT(h.hearing_date, ' ', COALESCE(h.hearing_time, '00:00:00'))) AS min_dt
          FROM hearings h
          WHERE h.hearing_date >= CURDATE()
            AND h.status NOT IN ('Cancelled', 'Completed')
          GROUP BY h.case_id
        ) x ON x.case_id = h1.case_id
          AND CONCAT(h1.hearing_date, ' ', COALESCE(h1.hearing_time, '00:00:00')) = x.min_dt
        WHERE h1.status NOT IN ('Cancelled', 'Completed')
      ) nh ON nh.case_id = c.id
    `;

    const [rows] = await db.promise.query(query);
    if (!rows || rows.length === 0) return;
    logger.info(`HearingTrackingEngine: syncing next hearings for ${rows.length} cases`);

    const upsert = `
      INSERT INTO case_hearing_state
        (case_id, advocate_id, next_hearing_id, next_hearing_date, next_hearing_time, has_hearing_tomorrow)
      VALUES
        (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        advocate_id = VALUES(advocate_id),
        next_hearing_id = VALUES(next_hearing_id),
        next_hearing_date = VALUES(next_hearing_date),
        next_hearing_time = VALUES(next_hearing_time),
        has_hearing_tomorrow = VALUES(has_hearing_tomorrow),
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const r of rows) {
      // tomorrow flag is filled by markTomorrowFlags(), keep false here
      await db.promise.query(upsert, [
        r.case_id,
        r.advocate_id,
        r.next_hearing_id || null,
        r.next_hearing_date || null,
        r.next_hearing_time || null,
        false,
      ]);
    }
  }

  /**
   * Recompute state for one case (called after hearing edits).
   */
  static async syncNextHearingForCase(caseId) {
    const query = `
      SELECT
        c.id AS case_id,
        c.advocate_id,
        nh.id AS next_hearing_id,
        nh.hearing_date AS next_hearing_date,
        nh.hearing_time AS next_hearing_time
      FROM cases c
      LEFT JOIN (
        SELECT h.*
        FROM hearings h
        WHERE h.case_id = ?
          AND h.hearing_date >= CURDATE()
          AND h.status NOT IN ('Cancelled', 'Completed')
        ORDER BY h.hearing_date ASC, h.hearing_time ASC
        LIMIT 1
      ) nh ON nh.case_id = c.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const [rows] = await db.promise.query(query, [caseId, caseId]);
    const r = rows && rows[0];
    if (!r) return;

    const upsert = `
      INSERT INTO case_hearing_state
        (case_id, advocate_id, next_hearing_id, next_hearing_date, next_hearing_time, has_hearing_tomorrow)
      VALUES
        (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        advocate_id = VALUES(advocate_id),
        next_hearing_id = VALUES(next_hearing_id),
        next_hearing_date = VALUES(next_hearing_date),
        next_hearing_time = VALUES(next_hearing_time),
        updated_at = CURRENT_TIMESTAMP
    `;
    await db.promise.query(upsert, [
      r.case_id,
      r.advocate_id,
      r.next_hearing_id || null,
      r.next_hearing_date || null,
      r.next_hearing_time || null,
      false,
    ]);
  }

  /**
   * Detect schedule changes for upcoming hearings and notify advocates.
   * Uses hearing_schedule_state to compare a fingerprint.
   */
  static async detectScheduleChangesForUpcomingHearings() {
    const query = `
      SELECT
        h.*,
        c.advocate_id,
        c.case_title,
        c.case_number,
        a.email AS advocate_email
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      JOIN advocates a ON c.advocate_id = a.id
      WHERE h.hearing_date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
        AND h.status NOT IN ('Cancelled', 'Completed')
        AND a.is_active = TRUE
    `;

    const [hearings] = await db.promise.query(query);
    if (!hearings || hearings.length === 0) return;
    logger.info(`HearingTrackingEngine: scanning ${hearings.length} hearings for schedule changes`);

    for (const h of hearings) {
      const hash = scheduleFingerprint(h);

      const [existingRows] = await db.promise.query(
        `SELECT schedule_hash, change_count FROM hearing_schedule_state WHERE hearing_id = ? LIMIT 1`,
        [h.id]
      );
      const existing = existingRows && existingRows[0];

      if (!existing) {
        await db.promise.query(
          `INSERT INTO hearing_schedule_state
             (hearing_id, advocate_id, case_id, schedule_hash, last_seen_at, last_changed_at, change_count)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, 0)`,
          [h.id, h.advocate_id, h.case_id, hash]
        );
        continue;
      }

      if (existing.schedule_hash !== hash) {
        // Update state
        await db.promise.query(
          `UPDATE hearing_schedule_state
             SET schedule_hash = ?,
                 last_seen_at = CURRENT_TIMESTAMP,
                 last_changed_at = CURRENT_TIMESTAMP,
                 change_count = change_count + 1
           WHERE hearing_id = ?`,
          [hash, h.id]
        );

        // Avoid duplicate notifications within short period
        const [recent] = await db.promise.query(
          `SELECT id FROM notifications
           WHERE user_id = ?
             AND type = 'system_alert'
             AND related_type = 'hearing'
             AND related_id = ?
             AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR)
           LIMIT 1`,
          [h.advocate_id, h.id]
        );

        if (!recent || recent.length === 0) {
          await NotificationService.createNotification({
            user_id: h.advocate_id,
            type: 'system_alert',
            title: `Hearing schedule changed: ${h.case_title}`,
            message: `Updated hearing on ${new Date(h.hearing_date).toLocaleDateString()} at ${normalizeTime(h.hearing_time) || '--:--'} (${h.court_name || h.court_hall || 'Court'})`,
            related_type: 'hearing',
            related_id: h.id,
            priority: 'high',
          });
        }
      } else {
        await db.promise.query(
          `UPDATE hearing_schedule_state
             SET last_seen_at = CURRENT_TIMESTAMP
           WHERE hearing_id = ?`,
          [h.id]
        );
      }
    }
  }

  /**
   * Set has_hearing_tomorrow for each case and send "tomorrow" reminders once/day.
   */
  static async markTomorrowFlags() {
    // Reset tomorrow flags for all cases (derived)
    await db.promise.query(`UPDATE case_hearing_state SET has_hearing_tomorrow = FALSE`);

    const query = `
      SELECT
        h.id AS hearing_id,
        h.case_id,
        h.hearing_date,
        h.hearing_time,
        h.court_name,
        h.court_hall,
        c.advocate_id,
        c.case_title,
        c.case_number,
        a.email AS advocate_email
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      JOIN advocates a ON c.advocate_id = a.id
      WHERE DATE(h.hearing_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND h.status = 'Scheduled'
        AND a.is_active = TRUE
    `;

    const [rows] = await db.promise.query(query);
    if (!rows || rows.length === 0) return;
    logger.info(`HearingTrackingEngine: found ${rows.length} hearings scheduled for tomorrow`);

    // Mark cases with hearings tomorrow
    for (const r of rows) {
      await db.promise.query(
        `INSERT INTO case_hearing_state (case_id, advocate_id, next_hearing_id, next_hearing_date, next_hearing_time, has_hearing_tomorrow)
         VALUES (?, ?, NULL, NULL, NULL, TRUE)
         ON DUPLICATE KEY UPDATE
           has_hearing_tomorrow = TRUE,
           updated_at = CURRENT_TIMESTAMP`,
        [r.case_id, r.advocate_id]
      );

      // One "tomorrow" notification per hearing per day
      const [already] = await db.promise.query(
        `SELECT id FROM notifications
         WHERE user_id = ?
           AND type = 'hearing_reminder'
           AND related_type = 'hearing'
           AND related_id = ?
           AND DATE(created_at) = CURDATE()
         LIMIT 1`,
        [r.advocate_id, r.hearing_id]
      );

      if (!already || already.length === 0) {
        await NotificationService.createNotification({
          user_id: r.advocate_id,
          type: 'hearing_reminder',
          title: `Hearing tomorrow: ${r.case_title}`,
          message: `Tomorrow (${new Date(r.hearing_date).toLocaleDateString()}) at ${normalizeTime(r.hearing_time) || '--:--'} — ${r.court_name || r.court_hall || 'Court'}`,
          related_type: 'hearing',
          related_id: r.hearing_id,
          priority: 'high',
        });
      }
    }
  }
}

module.exports = HearingTrackingEngine;

