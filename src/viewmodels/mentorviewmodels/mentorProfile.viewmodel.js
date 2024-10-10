const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MentorViewModel {
  // Method to create a new job post
  async insert(name, tagline, about, languages, resume, rating, totalReview, userId, linkedinProfile, services, industry, discipline, location, yearOfExperience) {
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
          userId,
          linkedinProfile,
          industry, discipline, location, yearOfExperience,
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
  async getMentorProfile({ serviceName, location, discipline, industry, yearOfExperience }) {
    try {
      const mentorProfiles = await prisma.mentorProfile.findMany({
        where: {
          AND: [
            serviceName ? { services: { some: { name: { contains: serviceName } } } } : undefined,
            location ? { location: { contains: location } } : undefined,
            discipline ? { discipline: { contains: discipline } } : undefined,
            industry ? { industry: { contains: industry } } : undefined,
            yearOfExperience ? { yearOfExperience: { gte: parseInt(yearOfExperience, 10) } } : undefined,
          ].filter(Boolean), // Filters out undefined conditions
        },
        include: {
          services: true,
        },
      });

      return mentorProfiles;
    } catch (error) {
      throw new Error(error.message);
    }
  }



}

module.exports = new MentorViewModel();
