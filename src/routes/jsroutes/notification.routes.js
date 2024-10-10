const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/jscontrollers/notification.controller');
const middleware = require('../../middleware/auth.middleware');    // Ensure the path is correct

// Notification routes
router.get('/', middleware, notificationController.getNotifications);
router.post('/', middleware, notificationController.createNotification);

// Review routes
router.post('/review', middleware, notificationController.submitReview);

module.exports = router;
