const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAvatarUrl, generateVideoUrl } = require('../../url');

class SettingJSViewmodel {

  async getAllMentors() {
    console.log('getAllMentors');
    try {
      const mentors = await prisma.user.findMany({
        where: { role: 'MENTOR' },
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

      // Process mentor profiles
      mentors.forEach(mentor => {
        if (mentor.Profile) {
         
            if (mentor.Profile[0].avatarId) {
              
                mentor.Profile[0].avatarId = generateAvatarUrl(mentor.Profile[0].avatarId);
            }
            if (mentor.Profile[0].mentorvideolink) {
                mentor.Profile[0].mentorvideolink = generateVideoUrl(mentor.Profile[0].mentorvideolink);
            }
        }
    });

      return mentors;
    } catch (error) {
      throw new Error('Error fetching mentors: ' + error.message);
    }
  }

  async getMentorById(userId) {
    console.log(userId);
    try {
      const mentor = await prisma.user.findFirst({
        where: {
          AND: [
            { id: parseInt(userId, 10) },
            { role: 'MENTOR' }
          ]
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

      if (!mentor) {
        throw new Error('Mentor not found');
      }

      // Process mentor profile
      if (mentor.Profile) {
        if (mentor.Profile[0].avatarId) {
          mentor.Profile[0].avatarId = generateAvatarUrl(mentor.Profile[0].avatarId);
        }
        if (mentor.Profile[0].mentorvideolink) {
          mentor.Profile[0].mentorvideolink = generateVideoUrl(mentor.Profile[0].mentorvideolink);
        }
      }

      return mentor;
    } catch (error) {
      throw new Error('Error fetching mentor: ' + error.message);
    }
  }

}

module.exports = new SettingJSViewmodel();
