// src/viewmodels/notification.viewmodel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationViewModel {
  // Method to create a new notification
  async createNotification(userId, title, message,mentorId) {
    console.log(userId);
    console.log(title);
    console.log(message);
    try {
        console.log("inside try ");
      const newNotification = await prisma.notification.create({
        data: {
          title,
          message,
          userId,
          mentorId
        },
      });

      return { notification: newNotification };
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Method to get notifications for a specific user
  async getNotifications(userId) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: Number(userId),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Add flag for reviewPending
      const notificationsWithReviewFlag = notifications.map((notification) => ({
        ...notification,
        reviewPending: !notification.reviewSubmitted,
      }));

      return notificationsWithReviewFlag;
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  async submitReview(notificationId, message) {
    try {
      const review = await prisma.review.create({
        data: {
          content: message,
          notificationId,
        },
      });
  
    return review;
    }
      catch (error) {
      throw new Error(`Error submitting review: ${error.message}`);
    }
  }
  
}

module.exports = new NotificationViewModel();
