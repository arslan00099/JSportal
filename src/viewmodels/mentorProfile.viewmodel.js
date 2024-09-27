const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MentorViewModel {
  // Method to create a new job post
  async insert( name, tagline, about, languages, resume, rating, totalReview, profileId, linkedinProfile, services) {
    // Create the job post
    try {
        const newMentorProfile = await prisma.mentorProfile.create({
          data: {
            name,
            tagline,
            about,
            languages,
            resume,
            rating,
            totalReview,
            profileId,
            linkedinProfile,
            services: {
              create: services.map(service => ({
                name: service.name,
                description: service.description,
                pricing: service.pricing
              }))
            }
          },
          include: {
            services: true
          }
        });
    
        return (newMentorProfile);
      } catch (error) {
        return (error.message);
      }
  }

  // Method to search for job posts based on dynamic filters
  async getMentorProfile() {
    try {
        const mentorProfiles = await prisma.mentorProfile.findMany({
          include: {
            services: true,  
          }
        });
    
        return (mentorProfiles);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }

}

module.exports = new MentorViewModel();
