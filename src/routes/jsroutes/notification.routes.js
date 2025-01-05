const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/jscontrollers/notification.controller');
const middleware = require('../../middleware/auth.middleware');    // Ensure the path is correct

// Notification routes
router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);

// Review routes
router.post('/review', notificationController.submitReview);

module.exports = router;
