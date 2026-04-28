const os = require('os');
const cron = require('node-cron');
const logger = require('../config/logger');
const notificationJobRepository = require('../repositories/notificationJobRepository');
const notificationRepository = require('../repositories/notificationRepository');
const PushNotificationService = require('./pushNotificationService');

function backoffMs(attempt) {
  const a = Math.max(1, Number(attempt) || 1);
  // 1m, 2m, 4m, 8m, 15m (cap)
  const mins = Math.min(15, Math.pow(2, a - 1));
  return mins * 60 * 1000;
}

class NotificationQueueWorker {
  static initialize() {
    const enabled = process.env.ENABLE_NOTIFICATION_WORKER !== 'false';
    if (!enabled) {
      logger.info('NotificationQueueWorker disabled via ENABLE_NOTIFICATION_WORKER=false');
      return;
    }

    // Every minute, process due jobs.
    cron.schedule('* * * * *', async () => {
      try {
        await this.runOnce();
      } catch (error) {
        logger.error('NotificationQueueWorker tick error:', error);
      }
    });

    logger.info('NotificationQueueWorker initialized');
  }

  static async runOnce() {
    const lockedBy = `${os.hostname()}:${process.pid}`;
    const due = await notificationJobRepository.fetchDueQueued({ limit: 50 });
    if (!due.length) return;

    for (const job of due) {
      const locked = await notificationJobRepository.tryLockJob(job.id, lockedBy);
      if (!locked) continue;

      try {
        await this.processJob(job);
        await notificationJobRepository.markSent(job.id);
      } catch (error) {
        const retryAt = new Date(Date.now() + backoffMs((job.attempts || 0) + 1));
        await notificationJobRepository.markFailed(job.id, {
          errorMessage: error?.message || String(error),
          retryAt,
        });
      }
    }
  }

  static async processJob(job) {
    // Fetch notification (title/message/etc.)
    const notification = await notificationRepository.findById(job.notification_id);

    const payload = {
      notificationId: job.notification_id,
      title: notification?.title || 'Notification',
      message: notification?.message || '',
      type: notification?.type || null,
      related: {
        type: notification?.related_type || null,
        id: notification?.related_id || null,
      },
      priority: notification?.priority || null,
    };

    if (job.channel === 'push') {
      await PushNotificationService.sendToUser(job.user_id, payload);
      return;
    }

    if (job.channel === 'email') {
      // Email channel stays implemented by the existing emailService + redis list queue.
      // If needed later, we can route this job into NotificationService.queueEmailNotification().
      return;
    }
  }
}

module.exports = NotificationQueueWorker;

