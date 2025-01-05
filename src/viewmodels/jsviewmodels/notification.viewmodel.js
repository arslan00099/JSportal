// src/viewmodels/notification.viewmodel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationViewModel {
  // Method to create a new notification
  async createNotification(userId, title, message, mentorId = null) {
    try {
      // Log the incoming parameters for debugging
      console.log("UserID:", userId);
      console.log("Title:", title);
      console.log("Message:", message);
      console.log("MentorID:", mentorId);
  
      // Create the notification
      const newNotification = await prisma.notification.create({
        data: {
          title,
          message,
          userId,    // Foreign key for the user
          mentorId,  // Optional foreign key for the mentor
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

 
  
}

module.exports = new NotificationViewModel();
