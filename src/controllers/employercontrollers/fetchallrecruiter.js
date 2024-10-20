const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST a new notification
exports.getallRecruiterProfile = async (req, res) => {
  try {
    const recruiters = await prisma.user.findMany({
      where: {
        role: 'RECRUITER' // Fetch only users with the role 'RECRUITER'
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
            pricing: true,
          }
        },
        Certificate: true
      }
    });

    // Base URLs for avatar and video
    const avatarBaseUrl = `${req.protocol}://${req.get('host')}/utils/profilephotos`;
    const videoBaseUrl = `${req.protocol}://${req.get('host')}/utils/video`;

    const result = recruiters.map(recruiter => {
      const profile = recruiter.Profile || {};
      
      // Build URLs for avatar and mentor video if they exist
      const avatarUrl = profile.avatarId ? `${avatarBaseUrl}/${profile.avatarId}` : null;
      const mentorVideoUrl = profile.mentorvideolink ? `${videoBaseUrl}/${profile.mentorvideolink}` : null;

      return {
        id: recruiter.id,
        fullname: profile.fullname || 'N/A',
        tagline: profile.tagline || 'N/A',
        location: profile.location || 'N/A',
        about: profile.about || 'N/A',
        language: profile.language || 'N/A',
        avatarUrl: avatarUrl,
        videoUrl: mentorVideoUrl,
        services: recruiter.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          pricing: service.pricing,
        })),
        certificate: recruiter.Certificate || null
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recruiters: ' + error.message });
  }
};
