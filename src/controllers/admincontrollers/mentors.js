const {
  PrismaClient
} = require("@prisma/client");

const prisma = new PrismaClient();
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");

exports.getAllMentorsWithServices = async (req, res) => {
  try {
    // Fetch mentors with their services from related user
    const mentorsWithServices = await prisma.profile.findMany({
      where: {
        user: {
          role: "MENTOR", // Filter by 'MENTOR' role from the related 'User' model
        },
      },
      include: {
        user: {
          include: {
            services: true, // Fetch services for the user linked to the mentor profile
          },
        },
      },
    });

    // Transform the data for better readability
    const formattedResponse = mentorsWithServices.map((mentor) => ({
      id: mentor.id,
      name: mentor.fullname,
      tagline: mentor.tagline,
      about: mentor.about,
      languages: mentor.language || [], // Default to empty array if no languages
      rating: mentor.rating || 0, // Default rating if missing
      totalReview: mentor.totalReview || 0, // Default total reviews if missing
      location: mentor.location || "Not provided", // Default location if missing
      yearOfExperience: mentor.yearOfExperience || 0, // Default experience if missing
      linkedinProfile: mentor.companyLink || "Not provided", // Default LinkedIn profile if missing
      services: mentor.user?.services || [], // Services linked to the mentor (from user)
    }));

    // Respond with the formatted data
    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching mentors with services:", error.message);

    // Send error response with more specific error information
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentors with services.",
      error: error.message,
    });
  }
};

/*

exports.getMentorByidold = async (req, res) => {
  


  try {
    const mentor = await prisma.profile.findMany({
      where:  { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            services: true, // Fetch services for the user linked to the mentor profile
          },
        },
      },
    });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found for the given userId.",
      });
    }

    // Transform data for better readability
    const formattedResponse = {
      id: mentor.id,
      name: mentor.fullname,
      tagline: mentor.tagline,
      about: mentor.about,
      languages: mentor.languages,
      rating: mentor.rating,
      totalReview: mentor.totalReview,
      location: mentor.location,
      yearOfExperience: mentor.yearOfExperience,
      linkedinProfile: mentor.linkedinProfile,
      services: mentor.user?.services || [], // Services linked to the mentor
    };

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching mentor data by userId:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor data by userId.",
      error: error.message,
    });
  }
};

*/


exports.getMentorByidOLD = async (req, res) => {
  const { userId } = req.params;
  console.log("userId will be here ");
  console.log(userId);

  try {
    // Fetch mentors with their services from related user
    const mentorsWithServices = await prisma.profile.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            services: true, // Fetch services for the user linked to the mentor profile
            mentorSessions: true,
          },
        },
      },
    });

    // Transform the data for better readability
    const formattedResponse = mentorsWithServices.map((mentor) => ({
      id: mentor.id,
      email: mentor.user.email,
      name: mentor.fullname,
      phnumber: mentor.phnumber,
      tagline: mentor.tagline,
      about: mentor.about,
      languages: mentor.language || [], // Default to empty array if no languages
      profileStatus: mentor.profileStatus,
      rating: mentor.rating || 0, // Default rating if missing
      totalReview: mentor.totalReview || 0, // Default total reviews if missing
      location: mentor.location || "Not provided", // Default location if missing
      yearOfExperience: mentor.yearOfExperience || 0, // Default experience if missing
      linkedinProfile: mentor.companyLink || "Not provided", // Default LinkedIn profile if missing
      services: mentor.user?.services || [], // Services linked to the mentor (from user)
    }));

    // Respond with the formatted data
    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching mentors with services:", error.message);

    // Send error response with more specific error information
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentors with services.",
      error: error.message,
    });
  }
};


exports.getMentorByid = async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching mentor details for userId:", userId);

  try {
    // Fetch mentors with their sessions, services, and reviews
    const mentorsWithDetails = await prisma.profile.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            services: true, // Fetch services linked to the user
            mentorSessions: {
              include: {
                reviews: {
                  include: {
                    mentorSessionManagement: {
                      include: {
                        user: {
                          include: {
                            Profile: true, // Include the reviewer's profile
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the data for better readability
    const formattedResponse = mentorsWithDetails.map((mentor) => ({
      id: mentor.id,
      email: mentor.user.email,
      profilestatus:mentor.user.profileStatus,
      userstatus:mentor.user.userStatus,
      name: mentor.fullname,
      phnumber: mentor.phnumber,
      video: generateVideoUrl(mentor.mentorvideolink),
      avatarId:generateAvatarUrl(mentor.avatarId),
      tagline: mentor.tagline,
      about: mentor.about,
      languages: mentor.language || [], // Default to empty array if no languages
      profileStatus: mentor.profileStatus,
      rating: mentor.rating || 0, // Default rating if missing
      totalReview: mentor.totalReview || 0, // Default total reviews if missing
      location: mentor.location || "Not provided", // Default location if missing
      yearOfExperience: mentor.yearOfExperience || 0, // Default experience if missing
      linkedinProfile: mentor.companyLink || "Not provided", // Default LinkedIn profile if missing
      services: mentor.user?.services || [], // Services linked to the mentor
      sessions: mentor.user?.mentorSessions.map((session) => ({
        reviews: session.reviews.map((review) => ({
          rating: review.rating,
          content: review.content,
          reviewer: {
            fullname: review.mentorSessionManagement.user.Profile[0].fullname,
            avatarId: generateAvatarUrl(review.mentorSessionManagement.user.Profile[0].avatarId),
          },
        })),
      })),
    }));

    // Respond with the formatted data
    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching mentors with details:", error.message);

    // Send error response with specific error information
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor details.",
      error: error.message,
    });
  }
};


