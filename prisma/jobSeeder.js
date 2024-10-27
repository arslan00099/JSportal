// seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedJobs = async () => {
  const jobData = [
    {
      jobTitle: "Software Engineer",
      companyName: "Tech Solutions Inc.",
      location: "San Francisco, CA",
      description:
        "Develop and maintain web applications for high-performance environments.",
      applicationLink: "https://techsolutionsinc.jobs/apply",
      jobType: "Remote",
      minPrice: "70000",
      maxPrice: "100000",
      userId: 12,
    },
    {
      jobTitle: "Data Scientist",
      companyName: "Analytics Hub",
      location: "New York, NY",
      description:
        "Analyze large datasets to provide actionable insights for clients.",
      applicationLink: "https://analyticshub.jobs/apply",
      jobType: "On-site",
      minPrice: "80000",
      maxPrice: "120000",
      userId: 12,
    },
    {
      jobTitle: "Product Manager",
      companyName: "InnoVentures",
      location: "Austin, TX",
      description: "Lead product development from ideation to market launch.",
      applicationLink: "https://innoventures.jobs/apply",
      jobType: "Hybrid",
      minPrice: "90000",
      maxPrice: "130000",
      userId: 12,
    },
    {
      jobTitle: "UX/UI Designer",
      companyName: "CreativeWorks",
      location: "Seattle, WA",
      description:
        "Design user-centric interfaces for mobile and web applications.",
      applicationLink: "https://creativeworks.jobs/apply",
      jobType: "Remote",
      minPrice: "60000",
      maxPrice: "90000",
      userId: 12,
    },
    {
      jobTitle: "Marketing Specialist",
      companyName: "BrandBoost",
      location: "Los Angeles, CA",
      description:
        "Drive marketing campaigns and manage social media accounts.",
      applicationLink: "https://brandboost.jobs/apply",
      jobType: "On-site",
      minPrice: "30000",
      maxPrice: "50000",
      userId: 12,
    },
  ];

  try {
    for (const job of jobData) {
      await prisma.jobPost.create({
        data: job,
      });
    }
    console.log("Jobs seeded successfully.");
  } catch (error) {
    console.error("Error seeding jobs:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedJobs();
