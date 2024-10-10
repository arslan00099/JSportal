// src/controllers/notification.controller.js
const notificationViewModel = require('../../viewmodels/jsviewmodels/notification.viewmodel');

// POST a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message,mentorId } = req.body;
    const { userId } = req.user;
    console.log(title);
    console.log(message);
    console.log(userId);

    const result = await notificationViewModel.createNotification(userId, title, message,mentorId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await notificationViewModel.getNotifications(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST a review for a notification
exports.submitReview = async (req, res) => {
  try {
    const { notificationId, message } = req.body;
    const result = await notificationViewModel.submitReview(notificationId, message);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
