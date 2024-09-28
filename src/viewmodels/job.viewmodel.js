const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class JobViewModel {
  // Method to create a new job post
  async postJob(jobTitle, companyName, location, description, applicationLink, companyIcon, status = 'OPEN',time,salary,jobType) {
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
        jobType
      },
    });

 return newJobPost;
  }

  // Method to search for job posts based on dynamic filters
  async searchJobPosts({ jobTitle, companyName, location, jobType, pay, startDate, endDate, userId }) {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        jobTitle: {
          contains: jobTitle || '',
        },
        companyName: {
          contains: companyName || '',
        },
        location: {
          contains: location || '',
        },
        jobType: {
          contains: jobType || '',
        },
        salary: {
          contains: pay || '',
        },
        createdAt: {
          gte: startDate || undefined,
          lte: endDate || undefined,
        },
      },
      include: {
        saveJobpost: {
          where: {
            userId: userId, // Include saved jobs for this userId
          },
        },
        JobApplied: {
          where: {
            userId: userId, // Include applied jobs for this userId
          },
        },
      },
    });
  
    // Map through job posts and add applied and saved status
    return jobPosts.map((job) => ({
      ...job,
      applied: job.JobApplied.length > 0, // Set applied to true if the user applied for this job
      saved: job.saveJobpost.length > 0,   // Set saved to true if the user saved this job
    }));
  }
  
  
  


  async saveJobpost(jobId, userId) {
    try {
      // Check if the job post is already saved by the user
      const existingSaveJobpost = await prisma.saveJobpost.findFirst({
        where: {
          jobId: jobId,
          userId
        }
      });
  
      // If the job post is already saved, return a message
      if (existingSaveJobpost) {
        return { message: 'already saved' };
      }
  
      // If not, create a new saveJobpost entry
      const newSaveJobpost = await prisma.saveJobpost.create({
        data: {
          jobId: jobId,
          userId
        }
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
          userId
        }
      });
  
      // If the job post is already saved, return a message
      if (existingSaveJobpost) {
        return ('already Applied');
      }
  
      // If not, create a new saveJobpost entry
      const newSaveJobpost = await prisma.JobApplied.create({
        data: {
          jobId: jobId,
          userId
        }
      });
  
      return newSaveJobpost;
    } catch (error) {
      throw new Error(`Error saving job post: ${error.message}`);
    }
  }
  
}

module.exports = new JobViewModel();
