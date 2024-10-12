
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MentorViewModel {

  async getBookedMentorSessions(userId, startDate, endDate) {
    console.log(userId, startDate, endDate);
    try {
      // Build the date filter
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate); // Less than or equal to endDate
      }

      const sessions = await prisma.mentorSessionManagement.findMany({
        where: {
          mentorProfileId: userId, // Filter by mentorProfileId (mentor is the current user)
          ...(startDate || endDate ? { selectedDateTime: dateFilter } : {}), // Apply date filter if provided
        },
        include: {
          Service: {
            select: {
              name: true, // Select service name
              pricing: true,
              description: true,
            },
          },
          user: { // Access the related User (Job Seeker)
            select: {
              Profile: { // Fetch the related Profile
                select: {
                  fullname: true, // Select the fullname from the Profile model
                },
              },
            },
          },
        },
      });

      // Return only the required fields in list format
      const filteredSessions = sessions.map((session) => ({
        jsName: session.user?.Profile?.fullname || "N/A", // User's fullname (Job Seeker)
        serviceName: session.Service?.name || "N/A",
        servicePrice: session.Service?.pricing || "N/A",
        serviceDes: session.Service?.description || "N/A",
        sessionStatus: session.status || "N/A",


        selectedDateTime: session.selectedDateTime,
      }));

      return filteredSessions;
    } catch (error) {
      console.error("Error fetching mentor sessions:", error);
      throw error;
    }
  }





  async getBookedMentorEarnings(userId, startDate, endDate) {
    console.log(userId, startDate, endDate);
    try {
      // Build the filter for selectedDateTime
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate); // Less than or equal to endDate
      }

      const sessions = await prisma.mentorSessionManagement.findMany({
        where: {
          mentorProfileId: userId, // Filter by mentorProfileId
          ...(startDate || endDate ? { selectedDateTime: dateFilter } : {}), // Apply date filter if provided
        },
        include: {
          Service: {
            select: {
              name: true, // Select service name
              pricing: true,
              description: true,
            },
          },
          user: { // Access the related User
            select: {
              Profile: {
                select: {
                  fullname: true, // Select the fullname from the Profile model
                },
              },
            },
          },
        },
      });

      // Return only the required fields in list format
      const filteredSessions = sessions.map(session => ({
        jsName: session.user?.Profile?.fullname || "N/A", // Mentor's fullname
        serviceName: session.Service?.name || "N/A",
        servicePrice: session.Service?.pricing || "N/A",
        serviceDes: session.Service?.description || "N/A",
        paymentStatus: session.paymentStatus || "N/A", // Access paymentStatus from MentorSessionManagement
        selectedDateTime: session.selectedDateTime,
      }));

      return filteredSessions;
    } catch (error) {
      console.error("Error fetching mentor earnings:", error);
      throw error;
    }
  };

}

module.exports = new MentorViewModel();
