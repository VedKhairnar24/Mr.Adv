const BaseRepository = require('./baseRepository');
const db = require('../../config/db');
const logger = require('../config/logger');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadByUserId(userId, limit = 50) {
    try {
      const [rows] = await db.promise.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? AND is_read = FALSE 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Error getting unread notifications:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user with pagination
   */
  async getByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 50, filter = 'all' } = options;
      const offset = (page - 1) * limit;

      let query = `SELECT * FROM notifications WHERE user_id = ?`;
      const values = [userId];

      if (filter === 'unread') {
        query += ' AND is_read = FALSE';
      } else if (filter === 'read') {
        query += ' AND is_read = TRUE';
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const [rows] = await db.promise.query(query, values);
      return rows;
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const [result] = await db.promise.query(
        `UPDATE notifications 
         SET is_read = TRUE, delivered_at = NOW() 
         WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const [result] = await db.promise.query(
        `UPDATE notifications 
         SET is_read = TRUE, delivered_at = NOW() 
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    try {
      const [rows] = await db.promise.query(
        `SELECT COUNT(*) as count 
         FROM notifications 
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId) {
    try {
      const [rows] = await db.promise.query(
        `SELECT * FROM notification_preferences WHERE user_id = ?`,
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const existing = await this.getPreferences(userId);

      if (existing) {
        const [result] = await db.promise.query(
          `UPDATE notification_preferences 
           SET email_enabled = ?, 
               push_enabled = ?, 
               hearing_reminder_hours = ?, 
               deadline_reminder_days = ?,
               updated_at = NOW()
           WHERE user_id = ?`,
          [
            preferences.email_enabled ?? true,
            preferences.push_enabled ?? true,
            preferences.hearing_reminder_hours ?? 24,
            preferences.deadline_reminder_days ?? 3,
            userId,
          ]
        );
        return result.affectedRows > 0;
      } else {
        const [result] = await db.promise.query(
          `INSERT INTO notification_preferences 
           (user_id, email_enabled, push_enabled, hearing_reminder_hours, deadline_reminder_days)
           VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            preferences.email_enabled ?? true,
            preferences.push_enabled ?? true,
            preferences.hearing_reminder_hours ?? 24,
            preferences.deadline_reminder_days ?? 3,
          ]
        );
        return result.insertId;
      }
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

module.exports = new NotificationRepository();
