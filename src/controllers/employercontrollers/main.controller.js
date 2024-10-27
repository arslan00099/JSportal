const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

exports.updateProfile = async (req, res) => {
  const { fullname, companyName, companyLink, email, phnumber, companySize } =
    req.body;
  const avatarPath = req.file
    ? `/utils/profilephotos/${req.file.filename}`
    : null;
  try {
    const userId = Number(req.user.userId);

    // Fetch existing user with Profile details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Profile: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare profile data
    const profileData = {};
    if (fullname) profileData.fullname = fullname;
    if (companyName) profileData.companyName = companyName;
    if (companySize) profileData.companySize = companySize;
    if (companyLink) profileData.companyLink = companyLink;
    if (phnumber) profileData.phnumber = Number(phnumber);
    if (avatarPath) profileData.avatarId = avatarPath;

    // Check if there is an existing profile
    const profileId = user.Profile.length > 0 ? user.Profile[0].id : null;

    // Start a transaction to update both User and Profile
    const updatedData = await prisma.$transaction(async (prisma) => {
      // Update the User email if provided
      if (email) {
        await prisma.user.update({
          where: { id: userId },
          data: { email },
        });
      }

      // Update Profile
      const updatedProfile = profileId
        ? await prisma.profile.update({
            where: { id: profileId },
            data: profileData,
          })
        : await prisma.profile.create({
            data: {
              userId,
              ...profileData,
            },
          });
      return { updatedProfile };
    });

    res.status(200).json({ success: true, data: updatedData.updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile or email",
      error: error.message,
    });
  }
};

exports.updateLocation = async (req, res) => {
  const { city, state, address, country, postalCode } = req.body;

  try {
    const userId = Number(req.user.userId);

    // Fetch existing user with Location details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Location: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare location data
    const locationData = {};
    if (city) locationData.city = city;
    if (state) locationData.state = state;
    if (country) locationData.country = country;
    if (postalCode) locationData.postalCode = postalCode;
    if (address) locationData.address = address;

    // Check if there is an existing location
    const locationId = user.Location ? user.Location[0]?.id : null; // Get existing location ID
    // Update Location
    const updatedLocation = locationId
      ? await prisma.location.update({
          where: { id: locationId },
          data: locationData,
        })
      : await prisma.location.create({
          data: {
            ...locationData,
            userId,
          },
        });

    res.status(200).json({ success: true, data: updatedLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  console.log(req.user.userId);
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: Number(req.user.userId) },
      include: { Profile: true, Location: true },
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    const { password, ...userWithoutPassword } = userProfile;

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve profile", error });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from authenticated user
    const jobs = await prisma.jobPost.findMany({
      where: {
        userId,
      },
      include: {
        JobApplied: true,
      },
    });

    const filteredJobs = jobs.map((job) => ({
      id: job.id,
      randomId: job.randomId,
      jobTitle: job.jobTitle,
      status: job.status,
      createdAt: job.createdAt,
      applicationReceived: job.JobApplied.length,
    }));
    res.status(201).json({ success: true, data: filteredJobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get job post",
      error: error.message,
    });
  }
};

exports.getJobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.jobPost.findFirst({
      where: {
        randomId: jobId,
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get job post details",
      error: error.message,
    });
  }
};

// Create Job Post
exports.createJob = async (req, res) => {
  const {
    jobTitle,
    companyName,
    location,
    description,
    applicationLink,
    maxPrice,
    minPrice,
    jobType,
  } = req.body;

  try {
    const userId = req.user.userId;
    const randomId = crypto.randomBytes(4).toString("hex");

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Create job data object
    const jobData = {
      randomId,
      jobTitle,
      companyName,
      location,
      description,
      applicationLink,
      maxPrice,
      minPrice,
      jobType,
      userId: Number(userId),
    };

    // Create the job post
    const newJob = await prisma.jobPost.create({
      data: jobData,
    });

    // Create an activity log entry
    const activityData = {
      title: `New job for ${jobTitle} role is Posted`,
      userId: Number(userId),
    };

    await prisma.activity.create({
      data: activityData,
    });

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job post",
      error: error.message,
    });
  }
};

// Update Job Post
exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const {
    jobTitle,
    companyName,
    location,
    description,
    applicationLink,
    maxPrice,
    minPrice,
    jobType,
  } = req.body;

  try {
    const userId = req.user.id;

    const job = await prisma.jobPost.updateMany({
      where: { id, userId }, // Validate user ownership of the job post
      data: {
        jobTitle,
        companyName,
        location,
        description,
        applicationLink,
        maxPrice,
        minPrice,
        jobType,
      },
    });

    if (job.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Job post not found or unauthorized",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Job post updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job post",
      error: error.message,
    });
  }
};

// Delete Job Post
exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user.id; // Validate ownership

    const job = await prisma.jobPost.deleteMany({
      where: { id, userId },
    });

    if (job.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Job post not found or unauthorized",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Job post deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job post",
      error: error.message,
    });
  }
};

exports.getRecruiterList = async (req, res) => {
  try {
    const recruiters = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
      },
      include: {
        Profile: true,
        services: true,
      },
    });
    const filetedRecruiters = recruiters.map((item) => ({
      id: item.id,
      fullname: item.Profile[0]?.fullname,
      location: item.Profile[0]?.location,
      avatarId: "/utils/profilephotos/" + item.Profile[0]?.avatarId,
      services: item.services,
      rating: 0,
      reviews: 0,
    }));
    res.status(200).json({ success: true, data: filetedRecruiters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter list",
      error: error.message,
    });
  }
};

exports.getRecruiterDetails = async (req, res) => {
  const { recruiterId } = req.params;

  try {
    const recruiterDetails = await prisma.user.findUnique({
      where: {
        id: parseInt(recruiterId),
      },
      include: {
        Profile: {},
        Certificate: true,
        Documents: true,
        EmpolymentHistory: true,
        Education: true,
        services: true,
        Notification: {
          include: {
            Review: true,
          },
        },
      },
    });

    if (!recruiterDetails) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found!",
      });
    }

    const { password, ...otherDetail } = recruiterDetails;

    res.status(200).json({
      success: true,
      data: {
        ...otherDetail,
        Profile: otherDetail?.Profile?.map((item) => ({
          ...item,
          avatarId: item?.avatarId
            ? "/utils/profilePhotos/" + item?.avatarId
            : null,
        })),
      },
    });
  } catch (error) {
    console.error("Error retrieving recruiter details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recruiter details",
      error: error.message,
    });
  }
};
exports.getTimesheetListByRecruiterId = async (req, res) => {
  const { recruiterId } = req.params;

  try {
    const timesheets = await prisma.timeSheet.findMany({
      where: {
        recruiterHiring: {
          recruiterId: Number(recruiterId),
        },
      },
      include: {
        recruiterHiring: {
          include: {
            hiredServices: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: timesheets,
    });
  } catch (error) {
    console.error("Error retrieving recruiter details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recruiter details",
      error: error.message,
    });
  }
};
exports.getTimesheetDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const timesheets = await prisma.timeSheet.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        recruiterHiring: {
          include: {
            hiredServices: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: timesheets,
    });
  } catch (error) {
    console.error("Error retrieving recruiter details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recruiter details",
      error: error.message,
    });
  }
};

exports.getStaffMemberList = async (req, res) => {
  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        role: "STAFF_MEMBER",
      },
      include: {
        Profile: true,
      },
    });
    res.status(200).json({ success: true, data: staffMembers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff member list",
      error: error.message,
    });
  }
};
exports.getTalentList = async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
      },
      include: {
        Profile: true,
        services: true,
      },
    });
    const filetedTalent = mentors.map((item) => ({
      id: item.id,
      fullname: item.Profile[0]?.fullname,
      location: item.Profile[0]?.location,
      avatarId: item.Profile[0]?.avatarId
        ? "/utils/profilePhotos/" + item.Profile[0]?.avatarId
        : null,
      services: item.services,
      rating: 0,
      reviews: 0,
    }));
    res.status(200).json({ success: true, data: filetedTalent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff member list",
      error: error.message,
    });
  }
};

exports.getTalentDetail = async (req, res) => {
  const { id } = req.params; // Get the ID from request parameters

  try {
    const talent = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        Profile: true,
        Education: true,
        Certificate: true,
        EmpolymentHistory: true,
        Documents: true,
      },
    });

    if (!talent) {
      return res.status(404).json({
        success: false,
        message: "Talent not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...talent,
        Profile: talent?.Profile?.map((item) => ({
          ...item,
          avatarId: item?.avatarId
            ? "/utils/profilePhotos/" + item?.avatarId
            : null,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve talent details",
      error: error.message,
    });
  }
};

exports.getAppliedJobsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.jobPost.findFirst({
      where: {
        randomId: jobId,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    // Fetch applied jobs based on the jobId
    const appliedJobs = await prisma.jobApplied.findMany({
      where: {
        jobId: parseInt(job?.id),
      },
      include: {
        jobpost: true,
        User: {
          select: {
            Profile: {
              select: {
                fullname: true,
              },
            },
            Education: true,
            Documents: true,
            Location: true,
          },
        },
      },
    });

    if (!appliedJobs || appliedJobs.length === 0) {
      return res.status(200).json([]);
    }

    const appliedJobsFilter = appliedJobs.map((job) => ({
      id: job.id,
      fullname: job.User.Profile[0]?.fullname,
      workExperience: "N/A",
      qualification: job.User.Education.flatMap((item) => item.degreName),
      location:
        job.User.Location[0]?.city + " " + job.User.Location[0]?.country,
      zipCode: job.User.Location[0]?.postalCode,
      resume:
        job.User.Documents.length > 0
          ? job.User.Documents[0]?.resumeLink
          : "N/A",
      status: job.status,
    }));

    res.status(200).json({ success: true, data: appliedJobsFilter });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get applied jobs",
      error: error.message,
    });
  }
};

exports.hireRecruiter = async (req, res) => {
  const { recruiterId, services } = req.body;
  const userId = req.user.userId;

  // Check if the recruiter exists
  const user = await prisma.user.findFirst({
    where: {
      role: "RECRUITER",
      id: Number(recruiterId),
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Recruiter not found!",
    });
  }

  // Check if services are provided
  if (!Array.isArray(services) || services.length === 0) {
    return res.status(404).json({
      success: false,
      error: "Please add service to hired recruiter!",
    });
  }

  try {
    // Create a new RecruiterHiring entry with associated services
    const hiredRecruiter = await prisma.recruiterHiring.create({
      data: {
        recruiterId: Number(recruiterId),
        employerId: Number(userId),
        adminApprovalStatus: "PENDING",
        recruiterApprovalStatus: "PENDING",
        jobStatus: "OPEN",
        paymentStatus: "PENDING",
        hiredServices: {
          create: services.map((service) => ({
            serviceId: service.serviceId,
            startDate: service.startDate,
            endDate: service.endDate,
            jobDetail: service.jobDetail,
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      data: hiredRecruiter,
    });
  } catch (error) {
    console.error("Error hiring recruiter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to hire recruiter",
      error: error.message,
    });
  }
};

exports.getHiredRecruiters = async (req, res) => {
  const userId = req.user.userId; // Get the userId from the request context

  try {
    const hiredRecruiters = await prisma.recruiterHiring.findMany({
      where: {
        recruiterApprovalStatus: "APPROVED",
        employerId: userId,
      },
      include: {
        hiredServices: {
          include: {
            service: true,
          },
        },
        recruiter: {
          include: {
            Profile: true,
            services: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredData = await hiredRecruiters.map((hire) => ({
      id: hire.id,
      recruiterId: hire.recruiterId,
      avatarId: "/utils/profilephotos/" + hire.recruiter.Profile[0]?.avatarId,
      fullname: hire.recruiter.Profile[0]?.fullname,
      location: hire.recruiter.Profile[0]?.location,
      services: hire.hiredServices,
      rating: 0,
      reviews: 0,
    }));

    res.status(200).json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error retrieving hired recruiters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hired recruiters",
      error: error.message,
    });
  }
};

exports.getCountsByEmployerId = async (req, res) => {
  const userId = req.user.userId;
  const employerId = userId;

  try {
    const jobPostCount = await prisma.jobPost.count({
      where: {
        userId: employerId,
      },
    });

    const applicationReceivedCount = await prisma.jobApplied.count({
      where: {
        jobpost: {
          userId: employerId,
        },
      },
    });

    const hiredRecruiterCount = await prisma.recruiterHiring.count({
      where: {
        employerId: employerId,
      },
    });

    // Send the counts in the response
    res.status(200).json({
      success: true,
      data: {
        jobPostCount,
        applicationReceivedCount,
        hiredRecruiterCount,
      },
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch counts",
      error: error.message,
    });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.userId;

    const activities = await prisma.activity.findMany({
      where: {
        userId: Number(userId),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

exports.createCard = async (req, res) => {
  const { email, cardNumber, cardHolderName, expiryDate, cvv } = req.body;
  const userId = req.user.userId;
  try {
    const newCard = await prisma.card.create({
      data: {
        email,
        cardNumber,
        cardHolderName,
        expiryDate,
        cvv,
        userId: Number(userId),
      },
    });

    res.status(201).json({
      success: true,
      data: newCard,
    });
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create card",
      error: error.message,
    });
  }
};

exports.getCards = async (req, res) => {
  const userId = req.user.userId;

  try {
    const cards = await prisma.card.findMany({
      where: {
        userId: Number(userId),
      },
    });

    res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cards",
      error: error.message,
    });
  }
};

exports.deleteCard = async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.userId;

  try {
    const card = await prisma.card.findFirst({
      where: {
        id: Number(cardId),
        userId: Number(userId),
      },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found or does not belong to user",
      });
    }

    // Delete the card
    await prisma.card.delete({
      where: {
        id: Number(cardId),
      },
    });

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete card",
      error: error.message,
    });
  }
};
