const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import data
const users = require("./data/users");
const jobPosts = require("./data/jobPosts");
const notifications = require("./data/notifications");

async function main() {
  // Seed users
  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    console.log(`Created user: ${createdUser.email}`);
  }

  // Seed job posts
  // for (const jobPost of jobPosts) {
  //   const createdJobPost = await prisma.jobPost.create({
  //     data: jobPost,
  //   });
  //   console.log(`Created job post: ${createdJobPost.jobTitle}`);
  // }

  // Seed notifications
  for (const notification of notifications) {
    const createdNotification = await prisma.notification.create({
      data: notification,
    });
    console.log(`Created notification: ${createdNotification.title}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
