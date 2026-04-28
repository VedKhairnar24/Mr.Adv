const db = require('../../config/db');

class NotificationSubscriptionRepository {
  async upsertSubscription({ userId, endpoint, p256dh, auth, userAgent }) {
    const sql = `
      INSERT INTO notification_push_subscriptions
        (user_id, endpoint, p256dh, auth, user_agent, is_active, last_seen_at)
      VALUES
        (?, ?, ?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE
        p256dh = VALUES(p256dh),
        auth = VALUES(auth),
        user_agent = VALUES(user_agent),
        is_active = TRUE,
        last_seen_at = NOW(),
        updated_at = NOW()
    `;
    const [result] = await db.promise.query(sql, [
      userId,
      endpoint,
      p256dh,
      auth,
      userAgent || null,
    ]);
    return result.insertId || null;
  }

  async deactivateByEndpoint({ userId, endpoint }) {
    const sql = `
      UPDATE notification_push_subscriptions
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE user_id = ?
        AND endpoint = ?
    `;
    const [result] = await db.promise.query(sql, [userId, endpoint]);
    return result.affectedRows > 0;
  }

  async listActiveByUserId(userId) {
    const sql = `
      SELECT *
      FROM notification_push_subscriptions
      WHERE user_id = ?
        AND is_active = TRUE
      ORDER BY updated_at DESC
    `;
    const [rows] = await db.promise.query(sql, [userId]);
    return rows || [];
  }
}

module.exports = new NotificationSubscriptionRepository();

