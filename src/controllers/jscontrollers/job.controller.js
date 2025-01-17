// src/controllers/user.controller.js
const jobviewmodel = require("../../viewmodels/jsviewmodels/job.viewmodel");
const { PrismaClient, JobType } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");

// POST a new job
exports.postJob = async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      location,
      description,
      applicationLink,
      companyIcon,
      status,
      time,
      salary,
      jobType,
    } = req.body;
    console.log(time);
    console.log(salary);
    const result = await jobviewmodel.postJob(
      jobTitle,
      companyName,
      location,
      description,
      applicationLink,
      companyIcon,
      status,
      time,
      salary,
      jobType
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getJobOld = async (req, res) => {
  try {
    // Destructure query parameters from the request
    let { jobTitle, companyName, location, jobType, pay, dateRange } =
      req.query;
    let { userId } = req.user;
    // Normalize the string fields (convert to lowercase)
    jobTitle = jobTitle ? jobTitle.toLowerCase() : "";
    companyName = companyName ? companyName.toLowerCase() : "";
    location = location ? location.toLowerCase() : "";
    jobType = jobType ? jobType.toLowerCase() : "";
    pay = pay ? pay.toLowerCase() : "";

    // Split dateRange (if provided) to get start and end dates
    let startDate, endDate;
    if (dateRange) {
      const dates = dateRange.split(",");
      startDate = new Date(dates[0]);
      endDate = dates[1] ? new Date(dates[1]) : new Date();
    }

    // Fetch jobs using jobViewModel and pass filters
    const result = await jobviewmodel.searchJobPosts({
      userId,
      jobTitle,
      companyName,
      location,
      jobType,
      pay,
      startDate,
      endDate,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getJob = async (req, res) => {
  try {
    const { jobTitle, city, jobType, pay, companyName, startDate, endDate, userId } = req.query;

    console.log(jobTitle, city, jobType, pay, companyName, startDate, endDate, userId);

    const parsedPay = pay ? parseInt(pay) : undefined;
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Building the where clause dynamically
    const whereClause = {
      jobTitle: jobTitle ? { contains: jobTitle } : undefined,
      jobType: jobType || undefined,
      user: {
        Location: city ? { some: { city: { contains: city } } } : undefined,
        Profile: companyName ? { some: { companyName: { contains: companyName } } } : undefined,
      },
      AND: [],
    };

    if (parsedPay) {
      whereClause.AND.push(
        { minPrice: { lte: parsedPay } },
        { maxPrice: { gte: parsedPay } }
      );
    }

    if (parsedStartDate) {
      whereClause.AND.push({ createdAt: { gte: parsedStartDate } });
    }

    if (parsedEndDate) {
      whereClause.AND.push({ createdAt: { lte: parsedEndDate } });
    }

    // Fetch all jobs
    const jobs = await prisma.jobPost.findMany({
      where: whereClause,
      select: {
        id: true,
        jobTitle: true,
        description: true,
        jobType: true,
        minPrice: true,
        maxPrice: true,
        createdAt: true,
        user: {
          select: {
            Profile: { select: { companyName: true, avatarId: true } },
            Location: { select: { city: true } },
          },
        },
      },
    });

    let savedJobs = [];
    let appliedJobs = [];

    if (userId) {
      const parsedUserId = parseInt(userId);

      // Fetch saved jobs
      const savedJobRecords = await prisma.saveJobpost.findMany({
        where: { userId: parsedUserId },
        select: { jobId: true },
      });

      // Fetch applied jobs
      const appliedJobRecords = await prisma.jobApplied.findMany({
        where: { userId: parsedUserId },
        select: { jobId: true },
      });

      const savedJobIds = new Set(savedJobRecords.map((job) => job.jobId));
      const appliedJobIds = new Set(appliedJobRecords.map((job) => job.jobId));

      savedJobs = jobs.filter((job) => savedJobIds.has(job.id));
      appliedJobs = jobs.filter((job) => appliedJobIds.has(job.id));
    }

    // Transform job data
    const transformedJobs = jobs.map((job) => ({
      jobId: job.id,
      companyName: job.user?.Profile[0]?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile[0]?.avatarId) || null,
      title: job.jobTitle,
      jobType: job.jobType,
      description: job.description,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      createdAt: job.createdAt,
      city: job.user?.Location[0]?.city || null,
    }));

    const transformedSavedJobs = savedJobs.map((job) => ({
      jobId: job.id,
      companyName: job.user?.Profile[0]?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile[0]?.avatarId) || null,
      title: job.jobTitle,
      jobType: job.jobType,
      description: job.description,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      createdAt: job.createdAt,
      city: job.user?.Location[0]?.city || null,
    }));

    const transformedAppliedJobs = appliedJobs.map((job) => ({
      jobId: job.id,
      companyName: job.user?.Profile[0]?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile[0]?.avatarId) || null,
      title: job.jobTitle,
      jobType: job.jobType,
      description: job.description,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      createdAt: job.createdAt,
      city: job.user?.Location[0]?.city || null,
    }));

    return res.status(200).json({
      message: "Successfully fetched job posts with company details.",
      jobs: transformedJobs,
      savedJobs: transformedSavedJobs,
      appliedJobs: transformedAppliedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};




exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract job post ID from URL params
    const { userId } = req.query; // Extract userId from query params

    console.log("Fetching job details for ID:", id);

    // Query to fetch the job by ID
    const job = await prisma.jobPost.findUnique({
      where: {
        id: parseInt(id), // Convert the ID to an integer
      },
      select: {
        id: true,
        jobTitle: true,
        jobType: true,
        minPrice: true,
        maxPrice: true,
        createdAt: true,
        description: true,
        location: true,
        applicationLink: true,
        companyIcon: true,
        time: true,
        salary: true,
        userId: true,
        user: {
          select: {
            Profile: {
              select: {
                companyName: true,
                avatarId: true,
              },
            },
            Location: {
              select: {
                city: true,
              },
            },
          },
        },
      },
    });

    // If the job post is not found, return a 404 response
    if (!job) {
      return res.status(404).json({ error: "Job post not found." });
    }

    let jobApply = false;
    let appliedDate = null;
    let saveJob = false;

    if (userId) {
      const parsedUserId = parseInt(userId);

      // Check if the user has applied for the job and fetch appliedDate
      const appliedJob = await prisma.jobApplied.findFirst({
        where: {
          userId: parsedUserId,
          jobId: parseInt(id),
        },
        select: {
          appliedDate: true, // Fetch appliedDate
        },
      });

      if (appliedJob) {
        jobApply = true;
        appliedDate = appliedJob.appliedDate; // Store appliedDate
      }

      // Check if the user has saved the job
      const savedJob = await prisma.saveJobpost.findFirst({
        where: {
          userId: parsedUserId,
          jobId: parseInt(id),
        },
      });
      saveJob = !!savedJob;
    }

    // Transform the fetched job data into the desired format
    const transformedJob = {
      jobId: job.id,
      title: job.jobTitle,
      companyName: job.user?.Profile?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      description: job.description,
      applicationLink: job.applicationLink,
      salary: job.salary,
      time: job.time,
      city: job.user?.Location?.city || null,
      createdAt: job.createdAt,
      jobApply,
      appliedDate, // Include appliedDate in the response
      saveJob,
    };

    // Return the transformed job in the response
    return res.status(200).json({
      message: "Successfully fetched job post details.",
      data: transformedJob,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({ error: "Failed to fetch job details." });
  }
};



exports.saveJobpost = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = req.user;
    //const  userId= 11;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    await jobviewmodel.saveJobpost(jobId, userId);

    // Fetch the updated job details
    const job = await prisma.jobPost.findUnique({
      where: { id: parseInt(jobId) },
      select: {
        id: true,
        jobTitle: true,
        jobType: true,
        minPrice: true,
        maxPrice: true,
        createdAt: true,
        description: true,
        applicationLink: true,
        companyIcon: true,
        time: true,
        salary: true,
        userId: true,
        user: {
          select: {
            Profile: {
              select: {
                companyName: true,
                avatarId: true,
              },
            },
            Location: {
              select: {
                city: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job post not found." });
    }

    // Check if the job is saved and applied by the user
    let jobApply = false;
    let saveJob = true;

    const appliedJob = await prisma.jobApplied.findFirst({
      where: {
        userId: parseInt(userId),
        jobId: parseInt(jobId),
      },
    });
    jobApply = !!appliedJob;

    const transformedJob = {
      jobId: job.id,
      title: job.jobTitle,
      companyName: job.user?.Profile?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      description: job.description,
      applicationLink: job.applicationLink,
      salary: job.salary,
      time: job.time,
      city: job.user?.Location?.city || null,
      createdAt: job.createdAt,
      jobApply,
      saveJob,
    };

    res.status(200).json({
      message: "Successfully saved job post.",
      data: transformedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.appliedjob = async (req, res) => {
  try {
    const { jobId } = req.body;
    // const { userId } = req.user;
    const userId = 11;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    await jobviewmodel.applyJobpost(jobId, userId);

    // Fetch the updated job details
    const job = await prisma.jobPost.findUnique({
      where: { id: parseInt(jobId) },
      select: {
        id: true,
        jobTitle: true,
        jobType: true,
        minPrice: true,
        maxPrice: true,
        createdAt: true,
        description: true,
        applicationLink: true,
        companyIcon: true,
        time: true,
        salary: true,
        userId: true,
        user: {
          select: {
            Profile: {
              select: {
                companyName: true,
                avatarId: true,
              },
            },
            Location: {
              select: {
                city: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job post not found." });
    }

    // Check if the job is saved and applied by the user
    let jobApply = true;
    let saveJob = false;

    const savedJob = await prisma.saveJobpost.findFirst({
      where: {
        userId: parseInt(userId),
        jobId: parseInt(jobId),
      },
    });
    saveJob = !!savedJob;

    const transformedJob = {
      jobId: job.id,
      title: job.jobTitle,
      companyName: job.user?.Profile?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      description: job.description,
      applicationLink: job.applicationLink,
      salary: job.salary,
      time: job.time,
      city: job.user?.Location?.city || null,
      createdAt: job.createdAt,
      jobApply,
      saveJob,
    };

    res.status(200).json({
      message: "Successfully applied to job post.",
      data: transformedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobType = async (req, res) => {
  try {
    const jobTypes = Object.values(JobType); // Get enum values as an array
    return res.status(200).json({
      message: "Job types fetched successfully",
      data: jobTypes,
    });
  } catch (error) {
    console.error("Error fetching job types:", error);
    res.status(500).json({ error: "Failed to fetch job types" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const cities = await prisma.jobPost.findMany({
      select: {
        location: true, // Assuming 'location' stores city names
      },
      distinct: ["location"], // Fetch unique city names
    });

    // Extract unique city names into an array
    const uniqueCities = cities.map((job) => job.location).filter(Boolean);

    return res.status(200).json({
      message: "Cities fetched successfully",
      data: uniqueCities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};

exports.getCompanyNames = async (req, res) => {
  try {
    const companies = await prisma.profile.findMany({
      select: {
        companyName: true,
      },
      distinct: ["companyName"], // Apply distinct to Profile model
    });

    // Extract unique company names and filter out null values
    const uniqueCompanyNames = companies
      .map((profile) => profile.companyName)
      .filter(Boolean);

    return res.status(200).json({
      message: "Company names fetched successfully",
      data: uniqueCompanyNames,
    });
  } catch (error) {
    console.error("Error fetching company names:", error);
    res.status(500).json({ error: "Failed to fetch company names" });
  }
};









