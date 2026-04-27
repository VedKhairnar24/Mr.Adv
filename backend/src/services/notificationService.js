const notificationRepository = require('../repositories/notificationRepository');
const emailService = require('./emailService');
const redis = require('../config/redis');
const logger = require('../config/logger');

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data) {
    try {
      // Save to database
      const notification = await notificationRepository.create({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        related_type: data.related_type || null,
        related_id: data.related_id || null,
        priority: data.priority || 'medium',
        is_read: false,
        delivery_status: 'pending',
      });

      // Publish to Redis for real-time delivery
      await redis.publish(
        `notifications:${data.user_id}`,
        JSON.stringify(notification)
      );

      // Check if email should be sent
      const preferences = await notificationRepository.getPreferences(data.user_id);
      if (preferences && preferences.email_enabled) {
        await this.queueEmailNotification(notification);
      }

      logger.info(`Notification created for user ${data.user_id}: ${data.title}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Queue email notification (for background processing)
   */
  static async queueEmailNotification(notification) {
    try {
      // Add to Redis queue for background processing
      await redis.lpush(
        'email_queue',
        JSON.stringify({
          notificationId: notification.id,
          userId: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at,
        })
      );
      logger.debug(`Email notification queued: ${notification.id}`);
    } catch (error) {
      logger.error('Error queuing email notification:', error);
    }
  }

  /**
   * Send immediate email notification
   */
  static async sendImmediateEmail({ userId, userEmail, subject, html }) {
    try {
      const sent = await emailService.sendEmail({
        to: userEmail,
        subject,
        html,
      });

      if (sent) {
        await notificationRepository.update(userId, {
          delivery_status: 'sent',
          delivered_at: new Date(),
        });
      }
      return sent;
    } catch (error) {
      logger.error('Error sending immediate email:', error);
      return false;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      return await notificationRepository.getByUserId(userId, options);
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      return await notificationRepository.getUnreadCount(userId);
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      return await notificationRepository.markAsRead(notificationId, userId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId) {
    try {
      return await notificationRepository.markAllAsRead(userId);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  static async getPreferences(userId) {
    try {
      return await notificationRepository.getPreferences(userId);
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(userId, preferences) {
    try {
      return await notificationRepository.updatePreferences(userId, preferences);
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Create hearing reminder notification
   */
  static async createHearingReminder(hearing) {
    try {
      await this.createNotification({
        user_id: hearing.advocate_id,
        type: 'hearing_reminder',
        title: `Hearing Reminder: ${hearing.case_title}`,
        message: `Hearing scheduled for ${new Date(hearing.hearing_date).toLocaleDateString()} at ${hearing.hearing_time}`,
        related_type: 'hearing',
        related_id: hearing.id,
        priority: 'high',
      });

      // Send email if configured
      const preferences = await this.getPreferences(hearing.advocate_id);
      if (preferences && preferences.email_enabled && hearing.user_email) {
        await emailService.sendHearingReminder({
          userEmail: hearing.user_email,
          caseTitle: hearing.case_title,
          hearingDate: hearing.hearing_date,
          hearingTime: hearing.hearing_time,
          courtName: hearing.court_name,
        });
      }
    } catch (error) {
      logger.error('Error creating hearing reminder:', error);
      throw error;
    }
  }

  /**
   * Create task deadline notification
   */
  static async createDeadlineReminder(task) {
    try {
      await this.createNotification({
        user_id: task.assigned_to,
        type: 'deadline_approaching',
        title: `Task Deadline: ${task.title}`,
        message: `Task is due on ${new Date(task.due_date).toLocaleDateString()}`,
        related_type: 'task',
        related_id: task.id,
        priority: task.priority === 'urgent' ? 'urgent' : 'high',
      });

      // Send email if configured
      const preferences = await this.getPreferences(task.assigned_to);
      if (preferences && preferences.email_enabled && task.user_email) {
        await emailService.sendDeadlineWarning({
          userEmail: task.user_email,
          taskTitle: task.title,
          dueDate: task.due_date,
        });
      }
    } catch (error) {
      logger.error('Error creating deadline reminder:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
