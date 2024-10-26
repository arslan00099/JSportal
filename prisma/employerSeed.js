const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "employer@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "EMPLOYER",
      Profile: {
        create: {
          fullname: "Employer Example",
          phnumber: 213123123,
        },
      },
      Location: {
        create: {
          city: "California City",
          country: "USA",
          postalCode: 93505,
          state: "California",
        },
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
