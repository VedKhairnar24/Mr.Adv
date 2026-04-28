const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(verifyToken);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Real-time stream (SSE)
router.get('/stream', notificationController.stream);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', notificationController.updatePreferences);

// Push subscription
router.post('/push/subscribe', notificationController.subscribePush);

module.exports = router;
