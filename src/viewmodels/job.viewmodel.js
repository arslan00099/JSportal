const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class JobViewModel {
  // Method to create a new job post
  async postJob(jobTitle, companyName, location, description, applicationLink, companyIcon, status = 'OPEN',time,salary) {
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
        salary
      },
    });

    return { jobPost: newJobPost };
  }

  // Method to search for job posts based on dynamic filters
  async searchJobPosts(jobTitle) {
    console.log(jobTitle);
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        jobTitle: {
          contains: jobTitle || ''
        }
      }
    });
    return jobPosts;
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
          jsId: userId
        }
      });
  
      return newSaveJobpost;
    } catch (error) {
      throw new Error(`Error saving job post: ${error.message}`);
    }
  }
  
  
}

module.exports = new JobViewModel();
