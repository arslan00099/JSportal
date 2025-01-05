// src/controllers/notification.controller.js
const notificationViewModel = require('../../viewmodels/jsviewmodels/notification.viewmodel');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, mentorId, userId } = req.body;

    console.log(title);
    console.log(message);
    console.log(userId);
    console.log(mentorId);

    const result = await notificationViewModel.createNotification(userId, title, message, mentorId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    //const { userId } = req.user;
    const userId = 4;
    const result = await notificationViewModel.getNotifications(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST a review for a notification
exports.submitReview = async (req, res) => {
  const { notificationId, message, rating } = req.body;

  try {
    // Check if the notification exists
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        content: message,
        notificationId,
        rating,
        mentorSessionManagmentId: notification.mentorSessionManagmentId, // Link to the session if applicable
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error submitting review: ${error.message}`,
    });
  }
};

