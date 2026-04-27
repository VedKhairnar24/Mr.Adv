const NotificationService = require('../services/notificationService');
const logger = require('../config/logger');

class NotificationController {
  /**
   * Get all notifications for current user
   * GET /api/notifications
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const { page = 1, limit = 50, filter = 'all' } = req.query;

      const notifications = await NotificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        filter,
      });

      const unreadCount = await NotificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  static async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.advocateId || req.user?.id;

      const success = await NotificationService.markAsRead(notificationId, userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const count = await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      });
    }
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  static async getPreferences(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const preferences = await NotificationService.getPreferences(userId);

      res.json({
        success: true,
        data: preferences || {
          email_enabled: true,
          push_enabled: true,
          hearing_reminder_hours: 24,
          deadline_reminder_days: 3,
        },
      });
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification preferences',
        error: error.message,
      });
    }
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  static async updatePreferences(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const preferences = req.body;

      await NotificationService.updatePreferences(userId, preferences);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
      });
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message,
      });
    }
  }
}

module.exports = NotificationController;
