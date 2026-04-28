const webpush = require('web-push');
const logger = require('../config/logger');
const subscriptionRepo = require('../repositories/notificationSubscriptionRepository');

function isConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

function configureOnce() {
  if (!isConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  return true;
}

class PushNotificationService {
  static isEnabled() {
    return isConfigured();
  }

  static async sendToUser(userId, payload) {
    if (!configureOnce()) {
      logger.warn('Push notifications are not configured (missing VAPID env vars)');
      return { sent: 0, failed: 0, disabled: true };
    }

    const subs = await subscriptionRepo.listActiveByUserId(userId);
    if (!subs.length) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;

    const body = JSON.stringify(payload || {});

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const code = err?.statusCode || err?.status || null;
        logger.warn('Push send failed', { userId, code, message: err?.message });

        // 404/410 means subscription is gone.
        if (code === 404 || code === 410) {
          await subscriptionRepo.deactivateByEndpoint({ userId, endpoint: s.endpoint });
        }
      }
    }

    return { sent, failed };
  }
}

module.exports = PushNotificationService;

