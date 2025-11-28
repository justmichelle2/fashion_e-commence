const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.get('/preferences', authenticate, notificationController.getPreferences);
router.put('/preferences', authenticate, notificationController.updatePreferences);

module.exports = router;
