const { PrismaClient, UserRole } = require("@prisma/client");
const prisma = new PrismaClient();


async function main() {
  // Create a company
  const company = await prisma.companyDetails.create({
    data: {
      companyName: "Tech Innovators",
      companySize: "50-100",
      companyEmail: "contact@techinnovators.com",
      companyPhone: "+1234567890",
      companyLink: "https://techinnovators.com",
      companyImage: "https://example.com/logo.png",
    },
  });

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: "securepassword", // Hash before production use
      role: "STAFF_MEMBER", // Ensure USER role exists in your Prisma schema
      email_confirm: false,
      isActive: true,
      isAdmin: false,
      profileStatus: "UNVARIFIED",
      userStatus: "PENDING",
      staffStatus: "NOT_ENGAGED",
      companyId: company.id,
    },
  });

  // Create a profile for the user
  await prisma.profile.create({
    data: {
      userId: user.id,
      fullname: "John Doe",
      phnumber: "+1234567890",
      location: "New York, USA",
      about: "Software Engineer with expertise in IoT and backend development.",
      industry: "Technology",
      linkedinLink: "https://linkedin.com/in/johndoe",
      companyName: company.companyName,
      companySize: company.companySize,
      companyLink: company.companyLink,
    },
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
