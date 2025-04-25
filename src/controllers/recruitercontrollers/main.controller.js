const { PrismaClient } = require("@prisma/client");
const { generateAvatarUrl } = require("../../url");
const prisma = new PrismaClient();

exports.getAllJobSeeker = async (req, res) => {
  try {
    // Check if the user profile exists
    const jobseekers = await prisma.user.findMany({
      where: {
        role: "JOB_SEEKER",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        Profile: {
          select: {
            fullname: true,
            phnumber: true,
            location: true,
            avatarId: true,
          },
        },
      },
    });
    const listFiltered = jobseekers.map((user) => ({
      id: user.id,
      avatarId: generateAvatarUrl(user.Profile[0]?.avatarId),
      fullname: user.Profile[0]?.fullname,
      location: user.Profile[0]?.location,
      phnumber: user.Profile[0]?.phnumber,
      email: user.email,
    }));

    res.status(200).json({ success: true, data: listFiltered });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
exports.getJobSeekerDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the user profile exists
    const jobseeker = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        email: true,
        Profile: {
          select: {
            fullname: true,
            phnumber: true,
            location: true,
            avatarId: true,
            services: true,
          },
        },
        Education: true,
        Certificate: true,
        EmpolymentHistory: true,
        Location: true,
        Documents: true,
      },
    });

    res.status(200).json({ success: true, data: jobseeker });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
