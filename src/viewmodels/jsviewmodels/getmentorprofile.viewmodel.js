// src/viewmodels/settingJS.viewmodel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
                  language: true
                }
              },
              services: {
                select: {
                  name: true,
                  description: true,
                  pricing: true
                }
              },
              Certificate: true
            }
          });
      
          // Base URLs for avatar and resume
          const avatarBaseUrl = "http://54.144.76.160:5000/utils/profilephotos";
      
          // Add full URL for avatar in Profile (if available)
          mentors.forEach(mentor => {
            if (mentor.Profile && mentor.Profile.avatarId) {
              mentor.Profile.avatarUrl = `${avatarBaseUrl}/${mentor.Profile.avatarId}`;
            }
          });
      
          return mentors;
        } catch (error) {
          throw new Error('Error fetching mentors: ' + error.message);
        }
      }
      
      

}

module.exports = new SettingJSViewmodel();
