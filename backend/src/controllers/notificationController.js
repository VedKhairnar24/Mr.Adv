const NotificationService = require('../services/notificationService');
const logger = require('../config/logger');
const subscriptionRepo = require('../repositories/notificationSubscriptionRepository');
const redis = require('../config/redis');

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

  /**
   * Register (or refresh) Web Push subscription for current user
   * POST /api/notifications/push/subscribe
   */
  static async subscribePush(req, res) {
    try {
      const userId = req.advocateId || req.user?.id;
      const { endpoint, keys } = req.body || {};

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription payload',
        });
      }

      await subscriptionRepo.upsertSubscription({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json({ success: true, message: 'Push subscription saved' });
    } catch (error) {
      logger.error('Error saving push subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save push subscription',
        error: error.message,
      });
    }
  }

  /**
   * Server-Sent Events stream for in-app notifications (Redis pub/sub)
   * GET /api/notifications/stream
   */
  static async stream(req, res) {
    const userId = req.advocateId || req.user?.id;
    const channel = `notifications:${userId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sub = redis.duplicate();
    let isClosed = false;

    const safeWrite = (data) => {
      if (isClosed) return;
      res.write(`data: ${data}\n\n`);
    };

    try {
      await sub.subscribe(channel);
      safeWrite(JSON.stringify({ type: 'connected', channel }));

      sub.on('message', (_chan, message) => {
        safeWrite(message);
      });
    } catch (error) {
      logger.error('Notification stream subscribe error:', error);
      safeWrite(JSON.stringify({ type: 'error', message: 'stream_failed' }));
      res.end();
      isClosed = true;
      try { await sub.quit(); } catch (_) {}
      return;
    }

    const heartbeat = setInterval(() => {
      safeWrite(JSON.stringify({ type: 'ping', ts: new Date().toISOString() }));
    }, 25000);

    req.on('close', async () => {
      isClosed = true;
      clearInterval(heartbeat);
      try {
        await sub.unsubscribe(channel);
        await sub.quit();
      } catch (_) {}
    });
  }
}

module.exports = NotificationController;
