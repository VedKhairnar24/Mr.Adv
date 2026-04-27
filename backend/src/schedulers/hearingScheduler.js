const cron = require('node-cron');
const db = require('../../config/db');
const NotificationService = require('../services/notificationService');
const logger = require('../config/logger');

class HearingScheduler {
  /**
   * Initialize all hearing-related schedulers
   */
  static initialize() {
    logger.info('Initializing hearing schedulers...');

    // Check for upcoming hearings every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running hearing reminder check...');
        await this.checkUpcomingHearings();
      } catch (error) {
        logger.error('Hearing scheduler error:', error);
      }
    });

    // Check for today's hearings every 30 minutes during business hours
    cron.schedule('*/30 8-18 * * 1-6', async () => {
      try {
        logger.info('Running today\'s hearings check...');
        await this.checkTodaysHearings();
      } catch (error) {
        logger.error('Today hearings scheduler error:', error);
      }
    });

    logger.info('Hearing schedulers initialized successfully');
  }

  /**
   * Check for hearings in the next 24-48 hours and send reminders
   */
  static async checkUpcomingHearings() {
    try {
      const query = `
        SELECT 
          h.*,
          c.case_title,
          c.case_number,
          a.id as advocate_id,
          a.email as advocate_email,
          a.name as advocate_name
        FROM hearings h
        JOIN cases c ON h.case_id = c.id
        JOIN advocates a ON c.advocate_id = a.id
        WHERE h.hearing_date BETWEEN DATE_ADD(NOW(), INTERVAL 24 HOUR) 
                                 AND DATE_ADD(NOW(), INTERVAL 48 HOUR)
          AND h.status = 'Scheduled'
          AND a.is_active = TRUE
      `;

      const [hearings] = await db.promise.query(query);

      logger.info(`Found ${hearings.length} upcoming hearings to remind`);

      for (const hearing of hearings) {
        // Check if reminder already sent (avoid duplicates)
        const reminderCheck = await db.promise.query(
          `SELECT id FROM notifications 
           WHERE user_id = ? 
             AND type = 'hearing_reminder' 
             AND related_type = 'hearing' 
             AND related_id = ?
             AND created_at > DATE_SUB(NOW(), INTERVAL 12 HOUR)`,
          [hearing.advocate_id, hearing.id]
        );

        if (reminderCheck[0].length === 0) {
          await NotificationService.createHearingReminder({
            id: hearing.id,
            advocate_id: hearing.advocate_id,
            user_email: hearing.advocate_email,
            case_title: hearing.case_title,
            case_number: hearing.case_number,
            hearing_date: hearing.hearing_date,
            hearing_time: hearing.hearing_time,
            court_name: hearing.court_name,
          });

          logger.info(`Hearing reminder sent for: ${hearing.case_title}`);
        }
      }
    } catch (error) {
      logger.error('Error checking upcoming hearings:', error);
      throw error;
    }
  }

  /**
   * Check for today's hearings and send morning alerts
   */
  static async checkTodaysHearings() {
    try {
      const query = `
        SELECT 
          h.*,
          c.case_title,
          c.case_number,
          a.id as advocate_id,
          a.email as advocate_email,
          a.name as advocate_name
        FROM hearings h
        JOIN cases c ON h.case_id = c.id
        JOIN advocates a ON c.advocate_id = a.id
        WHERE DATE(h.hearing_date) = CURDATE()
          AND h.status = 'Scheduled'
          AND a.is_active = TRUE
        ORDER BY h.hearing_time
      `;

      const [hearings] = await db.promise.query(query);

      logger.info(`Found ${hearings.length} hearings for today`);

      for (const hearing of hearings) {
        // Send reminder if hearing is in next 2 hours
        const hearingDateTime = new Date(`${hearing.hearing_date} ${hearing.hearing_time}`);
        const now = new Date();
        const hoursUntilHearing = (hearingDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilHearing > 0 && hoursUntilHearing <= 2) {
          // Check if immediate reminder already sent
          const reminderCheck = await db.promise.query(
            `SELECT id FROM notifications 
             WHERE user_id = ? 
               AND type = 'hearing_reminder' 
               AND related_type = 'hearing' 
               AND related_id = ?
               AND priority = 'urgent'
               AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
            [hearing.advocate_id, hearing.id]
          );

          if (reminderCheck[0].length === 0) {
            await NotificationService.createNotification({
              user_id: hearing.advocate_id,
              type: 'hearing_reminder',
              title: `🔴 URGENT: Hearing in ${Math.round(hoursUntilHearing)} hour(s)`,
              message: `${hearing.case_title} at ${hearing.hearing_time}`,
              related_type: 'hearing',
              related_id: hearing.id,
              priority: 'urgent',
            });

            logger.info(`Urgent hearing reminder sent: ${hearing.case_title}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error checking today\'s hearings:', error);
      throw error;
    }
  }

  /**
   * Manually trigger hearing check (for testing)
   */
  static async runManualCheck() {
    logger.info('Manual hearing check triggered');
    await this.checkUpcomingHearings();
    await this.checkTodaysHearings();
  }
}

module.exports = HearingScheduler;
