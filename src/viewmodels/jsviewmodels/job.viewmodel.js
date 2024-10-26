const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class JobViewModel {
  // Method to create a new job post
  async postJob(
    jobTitle,
    companyName,
    location,
    description,
    applicationLink,
    companyIcon,
    status = "OPEN",
    time,
    salary,
    jobType
  ) {
    // Create the job post
    const newJobPost = await prisma.jobPost.create({
      data: {
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
      },
    });

    return newJobPost;
  }

  // Method to search for job posts based on dynamic filters
  async searchJobPosts({
    jobTitle,
    companyName,
    location,
    jobType,
    pay,
    startDate,
    endDate,
    userId,
  }) {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        ...(jobTitle && {
          jobTitle: {
            contains: jobTitle,
          },
        }),
        ...(companyName && {
          companyName: {
            contains: companyName,
          },
        }),
        ...(location && {
          location: {
            contains: location,
          },
        }),
        ...(jobType && {
          jobType: {
            contains: jobType,
          },
        }),
        ...(pay && {
          salary: {
            contains: pay,
          },
        }),
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      include: {
        saveJobpost: {
          where: {
            userId: userId,
          },
        },
        JobApplied: {
          where: {
            userId: userId,
          },
        },
      },
    });

    // Map through job posts and add applied and saved status
    return jobPosts.map((job) => ({
      ...job,
      applied: job.JobApplied.length > 0,
      saved: job.saveJobpost.length > 0,
    }));
  }

  async saveJobpost(jobId, userId) {
    try {
      // Check if the job post is already saved by the user
      const existingSaveJobpost = await prisma.saveJobpost.findFirst({
        where: {
          jobId: jobId,
          userId,
        },
      });

      // If the job post is already saved, return a message
      if (existingSaveJobpost) {
        return { message: "already saved" };
      }

      // If not, create a new saveJobpost entry
      const newSaveJobpost = await prisma.saveJobpost.create({
        data: {
          jobId: jobId,
          userId,
        },
      });

      return newSaveJobpost;
    } catch (error) {
      throw new Error(`Error saving job post: ${error.message}`);
    }
  }

  async applyJobpost(jobId, userId) {
    try {
      // Check if the job post is already saved by the user
      const existingSaveJobpost = await prisma.JobApplied.findFirst({
        where: {
          jobId: jobId,
          userId,
        },
      });

      // If the job post is already saved, return a message
      if (existingSaveJobpost) {
        return "already Applied";
      }

      // If not, create a new saveJobpost entry
      const newSaveJobpost = await prisma.JobApplied.create({
        data: {
          jobId: jobId,
          userId,
        },
      });

      return newSaveJobpost;
    } catch (error) {
      throw new Error(`Error saving job post: ${error.message}`);
    }
  }
}

module.exports = new JobViewModel();
