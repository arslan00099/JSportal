const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Define custom data for the recruiter user
  const email = "alinasmith@example.com";
  const password = await bcrypt.hash("alinasmith", 10);
  const profileData = {
    fullname: "Alina Smith",
    phnumber: 987654321,
    location: "Los Angeles, USA",
    about: "Connecting industry leaders with top talent.",
    companyName: "Global Recruitment Solutions",
    tagline: "Your partner in talent acquisition.",
    industry: "Human Resources",
    language: "English, Spanish",
  };
  const educationData = [
    {
      degreName: "Master of Business Administration",
      universityName: "University of California, Los Angeles",
      description: "Specialized in Global Talent Management.",
      startFrom: new Date("2015-09-01").toLocaleDateString(),
      endIn: new Date("2017-06-01").toLocaleDateString(),
    },
  ];
  const certificateData = [
    {
      certName: "Advanced Talent Acquisition Certification",
      orgName: "International HR Organization",
      description: "Expertise in modern recruiting strategies.",
      startedOn: new Date("2020-01-01").toLocaleDateString(),
      completedOn: new Date("2020-06-01").toLocaleDateString(),
    },
  ];
  const employmentHistoryData = [
    {
      company: "WorldWide Recruiters",
      jobTitle: "Lead Recruiter",
      description: "Led a team of recruiters to fulfill global talent needs.",
      startedOn: new Date("2018-07-01").toLocaleDateString(),
      endOn: new Date("2023-08-01").toLocaleDateString(),
    },
  ];
  const locationData = {
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    postalCode: 90001,
  };
  const servicesData = [
    {
      name: "Global Talent Sourcing",
      description: "Connecting businesses with international professionals.",
      pricing: 20000, // price in cents
    },
    {
      name: "HR Process Improvement",
      description: "Optimizing HR and recruitment processes.",
      pricing: 18000, // price in cents
    },
  ];

  // Create the recruiter user with the specified data
  await prisma.user.create({
    data: {
      email,
      password,
      role: "RECRUITER",
      Profile: {
        create: profileData,
      },
      Education: {
        create: educationData,
      },
      Certificate: {
        create: certificateData,
      },
      EmpolymentHistory: {
        create: employmentHistoryData,
      },
      Location: {
        create: locationData,
      },
      services: {
        create: servicesData,
      },
    },
  });

  console.log("Custom recruiter created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
