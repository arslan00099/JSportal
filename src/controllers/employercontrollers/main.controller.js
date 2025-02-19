const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const multer = require("multer");
const upload = multer();
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");

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
    if (phnumber) profileData.phnumber = (phnumber);
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
      include: { Profile: true, Location: true, EmployerPointOfContact: true },
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



exports.updatePointOfContact = async (req, res) => {
  try {
    const { name, jobRole, phnumber, email, contactNumber } = req.body;
    const userId = Number(req.user.userId);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required to create a new point of contact",
      });
    }

    const existingContact = await prisma.employerPointOfContact.findFirst({
      where: { userId },
    });

    let updatedPointOfContact;
    if (existingContact) {
      updatedPointOfContact = await prisma.employerPointOfContact.update({
        where: { id: existingContact.id },
        data: { name, jobRole, phnumber, email, contactNumber },
      });
    } else {
      updatedPointOfContact = await prisma.employerPointOfContact.create({
        data: { userId, name, jobRole, phnumber, email, contactNumber },
      });
    }

    res.status(200).json({ success: true, data: updatedPointOfContact });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update point of contact",
      error: error.message,
    });
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
        role: "JOB_SEEKER",
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
      message: "Failed to fetch talent list",
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
        Location: true,
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
/////////////////////////////////////////////////////////////////////////
/////////////////////////////  APIS   ///////////////////////////////////
/////////////////////////////////////////////////////////////////////////

exports.getCounts = async (req, res) => {
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


exports.getStaffMembersByEmployerCompany = async (req, res) => {
  try {
    const { employerId } = req.params; // Employer's user ID from request parameters
    const { name, page = 1, limit = 10 } = req.query; // Query parameters for name filter and pagination

    // Validate input
    if (!employerId) {
      return res.status(400).json({
        success: false,
        message: "Employer ID is required.",
      });
    }

    // Fetch the employer profile
    const employerProfile = await prisma.profile.findUnique({
      where: { userId: parseInt(employerId) },
    });

    // Check if employer profile exists
    if (!employerProfile) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found.",
      });
    }

    const { companyName } = employerProfile;

    // Validate companyName
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Employer does not have a companyName associated.",
      });
    }

    // Build filter conditions for staff members
    const staffFilter = {
      companyName: companyName,
      user: {
        role: "STAFF_MEMBER",
      },
    };

    // If a name filter is provided, add it to the filter
    if (name) {
      staffFilter.fullname = {
        contains: name, // MySQL equivalent for partial matching

      };
    }

    // Convert `page` and `limit` to numbers and calculate skip value
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated staff members
    const staffMembers = await prisma.profile.findMany({
      where: staffFilter,
      select: {
        fullname: true,
        phnumber: true,
        avatarId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      skip: skip,
      take: limitNumber,
    });

    // Fetch total count of staff members for pagination
    const totalStaffCount = await prisma.profile.count({
      where: staffFilter,
    });

    // Check if staff members exist
    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No staff members found for the given company.",
      });
    }

    // Fetch subscriptions bought by the employer
    const subscriptionsBought = await prisma.subscriptionBought.findMany({
      where: { userId: parseInt(employerId) },
      select: {
        id: true,
        subscription: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
        price: true,
        jobSlots: true,
        resumeSearches: true,
        broughtAt: true,
      },
    });

    // Format staff members' response data
    const formattedStaffMembers = staffMembers.map((member) => ({
      fullname: member.fullname,
      phnumber: member.phnumber,
      avatarId: generateAvatarUrl(member.avatarId),
      email: member.user.email,
    }));

    // Format subscriptions bought response data
    const formattedSubscriptions = subscriptionsBought.map((subscription) => ({
      subscriptionBoughtId: subscription.id,
      name: subscription.subscription.name,
      description: subscription.subscription.description,
      pricePaid: subscription.price,
      jobSlots: subscription.jobSlots,
      resumeSearches: subscription.resumeSearches,
      purchasedAt: subscription.broughtAt,
    }));

    // Respond with paginated data
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully.",
      data: {
        staffMembers: formattedStaffMembers,
        subscriptionsBought: formattedSubscriptions,
      },
      pagination: {
        totalStaffCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalStaffCount / limitNumber),
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getActivities = async (req, res) => {
  try {
    // Pagination query parameters
    const { page = 1, limit = 10 } = req.query;

    // Convert pagination values to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated activities (without filtering by userId)
    const activities = await prisma.activity.findMany({
      select: {
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: skip,
      take: limitNumber,
      orderBy: {
        id: 'desc', // Sort activities by ID in descending order
      },
    });

    // Fetch total count of activities for pagination
    const totalActivitiesCount = await prisma.activity.count();

    // Respond with paginated activities and metadata
    return res.status(200).json({
      success: true,
      message: activities.length > 0 ? "Activities fetched successfully." : "No activities found.",
      data: activities,
      pagination: {
        totalActivitiesCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalActivitiesCount / limitNumber),
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};



// exports.getStaffmemberbyId = async (req, res) => {
//   const { userId } = req.params;
//   console.log("Fetching mentor details for userId:", userId);

//   try {
//     // Fetch mentors with their sessions, services, and reviews
//     const mentorsWithDetails = await prisma.profile.findMany({
//       where: { userId: parseInt(userId) },
//       include: {
//         user: {
//           include: {
//             services: true, // Fetch services linked to the user
//             mentorSessions: {
//               include: {
//                 reviews: {
//                   include: {
//                     mentorSessionManagement: {
//                       include: {
//                         user: {
//                           include: {
//                             Profile: true, // Include the reviewer's profile
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     // Transform the data for better readability
//     const formattedResponse = mentorsWithDetails.map((mentor) => ({
//       id: mentor.id,
//       email: mentor.user.email,
//       name: mentor.fullname,
//       phnumber: mentor.phnumber,
//       video: generateVideoUrl(mentor.mentorvideolink),
//       avatarId:generateAvatarUrl(mentor.avatarId),
//       tagline: mentor.tagline,
//       about: mentor.about,
//       languages: mentor.language || [], // Default to empty array if no languages
//       profileStatus: mentor.profileStatus,
//       rating: mentor.rating || 0, // Default rating if missing
//       totalReview: mentor.totalReview || 0, // Default total reviews if missing
//       location: mentor.location || "Not provided", // Default location if missing
//       yearOfExperience: mentor.yearOfExperience || 0, // Default experience if missing
//       linkedinProfile: mentor.companyLink || "Not provided", // Default LinkedIn profile if missing
//       services: mentor.user?.services || [], // Services linked to the mentor
//       sessions: mentor.user?.mentorSessions.map((session) => ({
//         reviews: session.reviews.map((review) => ({
//           rating: review.rating,
//           content: review.content,
//           reviewer: {
//             fullname: review.mentorSessionManagement.user.Profile[0].fullname,
//             avatarId: generateAvatarUrl(review.mentorSessionManagement.user.Profile[0].avatarId),
//           },
//         })),
//       })),
//     }));

//     // Respond with the formatted data
//     res.status(200).json({
//       success: true,
//       data: formattedResponse,
//     });
//   } catch (error) {
//     console.error("Error fetching mentors with details:", error.message);

//     // Send error response with specific error information
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch mentor details.",
//       error: error.message,
//     });
//   }
// };


exports.getSubscriptionDetailsOLD = async (req, res) => {
  console.log("Fetching subscription details and purchase history");

  try {
    // Fetch all available subscriptions
    const allSubscriptions = await prisma.subscription.findMany();

    // Fetch subscription purchase history (without filtering by userId)
    const subscriptionHistory = await prisma.subscriptionBought.findMany({
      include: {
        subscription: true, // Include subscription details
      },
      orderBy: {
        broughtAt: 'desc', // Sort by the date of purchase in descending order
      },
    });

    // If no subscriptions found in the purchase history, return empty array
    const formattedHistory = subscriptionHistory.length === 0 ? [] : subscriptionHistory.map((history) => ({
      subscriptionId: history.subscriptionId,
      broughtAt: history.broughtAt,
    }));

    // Transform all subscriptions for better readability
    const formattedSubscriptions = allSubscriptions.map((subscription) => ({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      description: subscription.description || "No description",
      price: subscription.price,
      jobSlots: subscription.jobSlots || 0,
      resumeSearches: subscription.resumeSearches || 0,
    }));

    // Respond with both subscription details and purchase history
    res.status(200).json({
      success: true,
      data: {
        allSubscriptions: formattedSubscriptions,
        purchaseHistory: formattedHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error.message);

    // Send error response with specific error information
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details.",
      error: error.message,
    });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  console.log("Fetching subscription details and purchase history for userId:", req.params.userId);

  try {
    const userId = parseInt(req.params.userId);  // Extract userId from the request parameters

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId provided.",
      });
    }

    // Fetch all available subscriptions
    const allSubscriptions = await prisma.subscription.findMany();

    // Fetch subscription purchase history for the specific userId
    const subscriptionHistory = await prisma.subscriptionBought.findMany({
      where: {
        userId: userId,  // Filter history by userId
      },
      include: {
        subscription: true, // Include subscription details
      },
      orderBy: {
        broughtAt: 'desc', // Sort by the date of purchase in descending order
      },
    });

    // If no subscriptions found in the purchase history, return an empty array
    const formattedHistory = subscriptionHistory.length === 0 ? [] : subscriptionHistory.map((history) => ({
      subscriptionId: history.subscriptionId,
      broughtAt: history.broughtAt,
      name: history.subscription.name,
      description: history.subscription.description || "No description",
      price: history.subscription.price,
      jobSlots: history.subscription.jobSlots || 0,
      resumeSearches: history.subscription.resumeSearches || 0,
    }));

    // Transform all subscriptions for better readability
    const formattedSubscriptions = allSubscriptions.map((subscription) => ({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      description: subscription.description || "No description",
      price: subscription.price,
      jobSlots: subscription.jobSlots || 0,
      resumeSearches: subscription.resumeSearches || 0,
    }));

    // Respond with both subscription details and purchase history
    res.status(200).json({
      success: true,
      data: {
        allSubscriptions: formattedSubscriptions,
        purchaseHistory: formattedHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error.message);

    // Send error response with specific error information
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details.",
      error: error.message,
    });
  }
};



exports.getAllStaffMembers = async (req, res) => {
  try {
    // Fetch all staff members
    const staffMembers = await prisma.profile.findMany({
      where: {
        user: {
          role: 'STAFF_MEMBER', // Filter by role 'STAFF_MEMBER'
        },
      },
      select: {
        fullname: true,
        phnumber: true,
        avatarId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Check if staff members exist
    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No staff members found.",
      });
    }

    // Format the response data
    const formattedStaffMembers = staffMembers.map((member) => ({
      email: member.user.email,
      fullname: member.fullname,
      phnumber: member.phnumber,
      avatarId: generateAvatarUrl(member.avatarId), // Assuming you have a function to generate the avatar URL
    }));

    // Respond with the data
    return res.status(200).json({
      success: true,
      message: "Staff members fetched successfully.",
      data: formattedStaffMembers,
    });
  } catch (error) {
    console.error("Error fetching staff members:", error.message);

    // Send error response with specific error information
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.manageUser = async (req, res) => {
  const { id } = req.params;
  const { action, email, secondaryEmail, isActive, deActivate, role, newPassword } = req.body;

  try {
    let result;

    switch (action) {
      case "updateProfile":
        result = await prisma.user.update({
          where: { id: parseInt(id) },
          data: {
            email,
            secondaryEmail,
            isActive,
            deActivate,
            role,
          },
        });
        delete result.password;
        res.json({ message: "User profile updated successfully", user: result });
        break;

      case "changePassword":
        if (!newPassword) {
          return res.status(400).json({ error: "New password is required" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        result = await prisma.user.update({
          where: { id: parseInt(id) },
          data: { password: hashedPassword },
        });
        delete result.password;
        res.json({ message: "Password updated successfully", user: result });
        break;

      case "deactivateAccount":
        result = await prisma.user.update({
          where: { id: parseInt(id) },
          data: { deActivate: true, isActive: false },
        });
        delete result.password;
        res.json({ message: "User deactivated successfully", user: result });
        break;

      case "delete":
        await prisma.user.delete({
          where: { id: parseInt(id) },
        });
        delete result.password;
        res.json({ message: "User deleted successfully" });
        break;

      default:
        res.status(400).json({ error: "Invalid action specified" });
        break;
    }
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
};


exports.buySubscription = async (req, res) => {
  const { userId, subscriptionId } = req.body;

  try {
    // Validate the subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Check if the user has already bought this subscription
    const existingSubscription = await prisma.subscriptionBought.findFirst({
      where: {
        userId,
        subscriptionId,
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this subscription.",
      });
    }

    // Create the subscription purchase
    const subscriptionBought = await prisma.subscriptionBought.create({
      data: {
        userId,
        subscriptionId,
        name: subscription.name, // Optional; can be removed in the future
        description: subscription.description,
        price: subscription.price,
        jobSlots: subscription.jobSlots || null,
        totalJobSlots: subscription.jobSlots || null, // Initialize total slots
        resumeSearches: subscription.resumeSearches || null,
        toalResumeSerarches: subscription.resumeSearches || null, // Initialize total searches
      },
    });

    res.status(201).json({
      success: true,
      message: "Subscription purchased successfully.",
      data: subscriptionBought,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error buying subscription: ${error.message}`,
    });
  }
};


exports.getBoughtSubscriptions = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Fetch subscriptions bought by the user
    const subscriptions = await prisma.subscriptionBought.findMany({
      where: {
        userId: parseInt(userId), // Ensure userId is an integer
      },
      include: {
        subscription: true, // Include details of the subscription
      },
    });

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully.",
      data: subscriptions, // Returns empty array if no subscriptions found
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching subscriptions: ${error.message}`,
    });
  }
};


exports.updateEmail = async (req, res) => {
  const { userId } = req.params; // Assuming user ID is available from auth middleware
  const { secondaryEmail } = req.body;

  try {


    // Update user emails
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt("1", 10),
      },
      data: {
        secondaryEmail,
      },
    });

    res.status(200).json({
      success: true,
      message: "Email addresses updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error updating emails: ${error.message}`,
    });
  }
};

exports.changePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Ensure userId is a valid number
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: userIdNumber } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Compare current password with stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userIdNumber },
      data: { password: hashedPassword },
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    // Send error response
    return res.status(500).json({
      success: false,
      message: `Error updating password: ${error.message}`,
    });
  }
};


exports.deactivateProfile = async (req, res) => {
  const { userId } = req.params;

  try {

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isActive: false },
    });

    res.status(200).json({


      success: true,
      message: "Profile deactivated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error deactivating profile: ${error.message}`,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  const { userId } = req.params; // Assuming user ID is available from auth middleware

  try {
    // Delete user record
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error deleting profile: ${error.message}`,
    });
  }
};



exports.transferEmployerAccount = async (req, res) => {
  const { currentEmployerId, newEmployerId } = req.body;

  try {
    // Validate IDs
    const currentId = Number(currentEmployerId);
    const newId = Number(newEmployerId);

    if (isNaN(currentId) || isNaN(newId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employer IDs provided.",
      });
    }

    // Fetch both users and validate their roles
    const [currentEmployer, newEmployer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentId },
        select: { id: true, role: true },
      }),
      prisma.user.findUnique({
        where: { id: newId },
        select: { id: true, role: true },
      }),
    ]);

    if (!currentEmployer || !newEmployer) {
      return res.status(404).json({
        success: false,
        message: "One or both users do not exist.",
      });
    }

    if (currentEmployer.role !== "EMPLOYER") {
      return res.status(400).json({
        success: false,
        message: `User with ID ${currentId} is not an employer.`,
      });
    }

    if (newEmployer.role !== "EMPLOYER") {
      return res.status(400).json({
        success: false,
        message: `User with ID ${newId} is not an employer.`,
      });
    }

    // Transfer ownership of related RecruiterHiring records
    const updatedRecords = await prisma.recruiterHiring.updateMany({
      where: { employerId: currentId },
      data: { employerId: newId },
    });
    const updatedSubscriptions = await prisma.subscriptionBought.updateMany({
      where: { userId: currentId },
      data: { userId: newId },
    });

    return res.status(200).json({
      success: true,
      message: `Account successfully transferred from Employer ${currentId} to Employer ${newId}.`,
      updatedRecords: updatedRecords.count,
      updatedSubscriptions: updatedSubscriptions.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error transferring account: ${error.message}`,
    });
  }
};


exports.updateActiveCard = async (req, res) => {
  const { userId, activeCardId } = req.body;

  try {
    // Validate input
    const userIdInt = Number(userId);
    const activeCardIdInt = Number(activeCardId);

    if (isNaN(userIdInt) || isNaN(activeCardIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or activeCardId provided.",
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userIdInt} not found.`,
      });
    }

    // Check if the card exists and belongs to the user
    const card = await prisma.card.findUnique({
      where: { id: activeCardIdInt },
    });

    if (!card || card.userId !== userIdInt) {
      return res.status(400).json({
        success: false,
        message: `Card with ID ${activeCardIdInt} not found or does not belong to the user.`,
      });
    }

    // Update user's activeCardId
    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: { activeCardId: activeCardIdInt },
    });

    return res.status(200).json({
      success: true,
      message: "Active card updated successfully.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        activeCardId: updatedUser.activeCardId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating active card: ${error.message}`,
    });
  }
};

//////////////////////////////////////////////////////////////
exports.getStafmemberDetails = async (req, res) => {
  // Extract and convert userId from params to an integer
  const employerId = Number(req.params.userId);

  if (isNaN(employerId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employer ID provided.",
    });
  }

  try {
    // Count the number of job posts created by the employer
    const jobPostCount = await prisma.jobPost.count({
      where: {
        userId: employerId,
      },
    });

    // Count the number of applications received for jobs posted by this employer
    const applicationReceivedCount = await prisma.jobApplied.count({
      where: {
        jobpost: {
          userId: employerId,
        },
      },
    });

    // Count the number of recruiters hired by the employer
    const hiredRecruiterCount = await prisma.recruiterHiring.count({
      where: {
        employerId: employerId,
      },
    });

    // Fetch the employer's recent activities
    const activities = await prisma.activity.findMany({
      where: {
        userId: employerId,
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

    // Send the response
    res.status(200).json({
      success: true,
      data: {
        jobPostCount,
        applicationReceivedCount,
        hiredRecruiterCount,
        activities,
      },
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch counts.",
      error: error.message,
    });
  }
};








