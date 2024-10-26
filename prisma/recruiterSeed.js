const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "recruiter@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "RECRUITER",
      Profile: {
        create: {
          fullname: "Recruiter Example",
          phnumber: 123456789,
          location: "New York, USA",
          about: "Connecting talented professionals with top companies.",
          companyName: "Recruitment Hub",
          tagline: "Finding the right talent.",
          industry: "Recruitment",
          language: "English",
        },
      },
      Education: {
        create: [
          {
            degreName: "Bachelor of Business Administration",
            universityName: "New York University",
            description: "Focused on Human Resources and Talent Acquisition.",
            startFrom: "2010-09-01T00:00:00.000Z",
            endIn: "2014-06-01T00:00:00.000Z",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "Certified Professional Recruiter",
            orgName: "Recruitment Association",
            description: "Certification for professional recruiting practices.",
            startedOn: "2019-01-01T00:00:00.000Z",
            completedOn: "2019-06-01T00:00:00.000Z",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Talent Connect",
            jobTitle: "Senior Recruiter",
            description: "Managed end-to-end recruitment processes.",
            startedOn: "2015-07-01T00:00:00.000Z",
            endOn: "2020-08-01T00:00:00.000Z",
          },
        ],
      },
      Location: {
        create: {
          city: "New York",
          state: "NY",
          country: "USA",
          postalCode: 10001,
        },
      },
      services: {
        create: [
          {
            name: "Talent Acquisition Consulting",
            description: "Providing insights on effective talent acquisition.",
            pricing: 15000, // price in cents
          },
          {
            name: "Recruitment Process Optimization",
            description: "Streamlining recruitment processes.",
            pricing: 10000, // price in cents
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
