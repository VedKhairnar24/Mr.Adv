const db = require('../../config/db');
const logger = require('../config/logger');

class NotificationJobRepository {
  async enqueue({ notificationId, userId, channel, runAt, priorityScore, maxAttempts = 5 }) {
    const sql = `
      INSERT INTO notification_jobs
        (notification_id, user_id, channel, status, run_at, priority, max_attempts)
      VALUES
        (?, ?, ?, 'queued', ?, ?, ?)
    `;
    const params = [
      notificationId,
      userId,
      channel,
      runAt,
      priorityScore,
      maxAttempts,
    ];
    const [result] = await db.promise.query(sql, params);
    return result.insertId;
  }

  async fetchDueQueued({ limit = 50 }) {
    const sql = `
      SELECT *
      FROM notification_jobs
      WHERE status = 'queued'
        AND run_at <= NOW()
      ORDER BY priority DESC, run_at ASC, id ASC
      LIMIT ?
    `;
    const [rows] = await db.promise.query(sql, [limit]);
    return rows || [];
  }

  async tryLockJob(jobId, lockedBy) {
    const sql = `
      UPDATE notification_jobs
      SET status = 'processing',
          locked_at = NOW(),
          locked_by = ?,
          updated_at = NOW()
      WHERE id = ?
        AND status = 'queued'
    `;
    const [result] = await db.promise.query(sql, [lockedBy, jobId]);
    return result.affectedRows > 0;
  }

  async markSent(jobId) {
    const sql = `
      UPDATE notification_jobs
      SET status = 'sent',
          updated_at = NOW()
      WHERE id = ?
    `;
    await db.promise.query(sql, [jobId]);
  }

  async markFailed(jobId, { errorMessage, retryAt }) {
    try {
      const sql = `
        UPDATE notification_jobs
        SET status = CASE
              WHEN attempts + 1 >= max_attempts THEN 'failed'
              ELSE 'queued'
            END,
            attempts = attempts + 1,
            last_error = ?,
            run_at = CASE
              WHEN attempts + 1 >= max_attempts THEN run_at
              ELSE ?
            END,
            locked_at = NULL,
            locked_by = NULL,
            updated_at = NOW()
        WHERE id = ?
      `;
      await db.promise.query(sql, [String(errorMessage || ''), retryAt, jobId]);
    } catch (error) {
      logger.error('Error marking notification job failed:', error);
    }
  }
}

module.exports = new NotificationJobRepository();

