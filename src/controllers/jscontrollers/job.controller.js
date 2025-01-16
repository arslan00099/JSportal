// src/controllers/user.controller.js
const jobviewmodel = require("../../viewmodels/jsviewmodels/job.viewmodel");
const { PrismaClient } = require('@prisma/client');
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

exports.getJobl = async (req, res) => {
  try {
    const { jobTitle, city, jobType, pay, companyName, startDate, endDate } = req.query; // Extract query parameters
    console.log(jobTitle, city, jobType, pay, companyName, startDate, endDate);

    // Parse the 'pay' value as an integer
    const parsedPay = pay ? parseInt(pay) : undefined;

    // Parse startDate and endDate to Date objects
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Building the where clause dynamically based on the provided query params
    const whereClause = {
      jobTitle: jobTitle ? { contains: jobTitle } : undefined, // Job Title filter
      jobType: jobType ? jobType : undefined, // Job Type filter
      user: {
        Location: city ? { some: { city: { contains: city } } } : undefined, // City filter
        Profile: companyName ? { some: { companyName: { contains: companyName } } } : undefined, // Company Name filter
      },
      AND: [],
    };

    // Pay filter: Check if 'pay' exists and ensure it's within the range of minPrice and maxPrice
    if (parsedPay) {
      whereClause.AND.push(
        {
          minPrice: {
            lte: parsedPay, // Compare pay with minPrice as an integer
          },
        },
        {
          maxPrice: {
            gte: parsedPay, // Compare pay with maxPrice as an integer
          },
        }
      );
    }

    // Date range filter: Check if 'startDate' and 'endDate' are provided
    if (parsedStartDate) {
      whereClause.AND.push({
        createdAt: {
          gte: parsedStartDate, // Compare createdAt with startDate
        },
      });
    }

    if (parsedEndDate) {
      whereClause.AND.push({
        createdAt: {
          lte: parsedEndDate, // Compare createdAt with endDate
        },
      });
    }

    // Query to fetch the jobs from the database
    const jobs = await prisma.jobPost.findMany({
      where: whereClause,
      select: {
        id:true,
        jobTitle: true,
        jobType: true,
        minPrice: true,
        maxPrice: true,
        createdAt: true,
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

    // Map over the fetched jobs to transform the data structure as required
    const transformedJobs = jobs.map((job) => ({
      jobId:job.id,
      companyName: job.user?.Profile?.companyName || null, // Ensure compatibility with array structure
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      title: job.jobTitle,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      createdAt: job.createdAt,
      city: job.user?.Location?.city || null,
    
    }));

    // Return the transformed jobs in the response
    return res.status(200).json({
      message: "Successfully fetched job posts with company details.",
      data: transformedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
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

    // Fetch jobs
    const jobs = await prisma.jobPost.findMany({
      where: whereClause,
      select: {
        id: true,
        jobTitle: true,
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

    let savedJobIds = new Set();
    let appliedJobIds = new Set();

    if (userId) {
      const parsedUserId = parseInt(userId);

      // Fetch saved jobs
      const savedJobs = await prisma.saveJobpost.findMany({
        where: { userId: parsedUserId },
        select: { jobId: true },
      });

      // Fetch applied jobs
      const appliedJobs = await prisma.jobApplied.findMany({
        where: { userId: parsedUserId },
        select: { jobId: true },
      });

      savedJobIds = new Set(savedJobs.map((job) => job.jobId));
      appliedJobIds = new Set(appliedJobs.map((job) => job.jobId));
    }

    // Transform job data
    const transformedJobs = jobs.map((job) => ({
      jobId: job.id,
      companyName: job.user?.Profile?.companyName || null,
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      title: job.jobTitle,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      createdAt: job.createdAt,
      city: job.user?.Location?.city || null,
      savedjob: savedJobIds.has(job.id), // Returns true if job is saved
      appliedjob: appliedJobIds.has(job.id), // Returns true if job is applied
    }));

    return res.status(200).json({
      message: "Successfully fetched job posts with company details.",
      data: transformedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};



exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract job post ID from URL params
    console.log("Fetching job details for ID:", id);

    // Query to fetch the job by ID
    const job = await prisma.jobPost.findUnique({
      where: {
        id: parseInt(id), // Convert the ID to an integer (assuming it is an integer type in your database)
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
        companyName: true,
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

    // Transform the fetched job data into the desired format
    const transformedJob = {
      jobId: job.id,
      title: job.jobTitle,
      companyName: job.companyName,
      companyIcon: generateAvatarUrl(job.user?.Profile?.avatarId) || null,
      jobType: job.jobType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      description: job.description,
      location: job.location,
      applicationLink: job.applicationLink,
      salary: job.salary,
      time: job.time,
      city: job.user?.Location?.city || null,
      createdAt: job.createdAt,
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

exports.saveJobpost= async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = req.user;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required" });
    }

    const result = await jobviewmodel.saveJobpost(jobId, userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.appliedjob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = req.user;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required" });
    }

    const result = await jobviewmodel.applyJobpost(jobId, userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};








