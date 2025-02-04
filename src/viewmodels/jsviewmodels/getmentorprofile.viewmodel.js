const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAvatarUrl, generateVideoUrl } = require('../../url');

class SettingJSViewmodel {

  async getAllMentors() {
    try {
      const mentors = await prisma.user.findMany({
        where: {
          role: 'MENTOR' // Fetch only users with the role 'MENTOR'
        },
        select: {
          id: true,
          Profile: {
            select: {
              avatarId: true,
              fullname: true,
              tagline: true,
              location: true,
              about: true,
              language: true,
              mentorvideolink: true,
            }
          },
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              pricing: true
            }
          },
          Certificate: true
        }
      });



      // Iterate over mentors and construct full URLs
      mentors.forEach(mentor => {
        if (mentor.Profile && mentor.Profile.length > 0) {
          const profile = mentor.Profile[0]; // Assuming only one profile per user

          if (profile.avatarId) {
            profile.avatarUrl = generateAvatarUrl(profile.avatarId);
          }

          if (profile.mentorvideolink) {
            profile.mentorvideolink = generateVideoUrl(profile.mentorvideolink);
          }
        }
      });

      return mentors;
    } catch (error) {
      throw new Error('Error fetching mentors: ' + error.message);
    }
  }
}

module.exports = new SettingJSViewmodel();
