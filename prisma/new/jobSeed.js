const { PrismaClient, UserRole } = require("@prisma/client");
const { faker } = require("@faker-js/faker"); // Import faker
const prisma = new PrismaClient();

async function main() {
    // Create an EMPLOYER user with random email and complete profile details
    const user = await prisma.user.create({
        data: {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: UserRole.EMPLOYER,
            profileStatus: "VERIFIED", // Correct enum value
            userStatus: "APPROVED",
            isActive: true,
            Profile: {
                create: {
                    fullname: faker.person.fullName(),
                    phnumber: faker.phone.number('+1-###-###-####'),
                    avatarId: faker.string.uuid(),
                    location: faker.location.city(),
                    companyName: faker.company.name(),
                    companySize: faker.number.int({ min: 10, max: 500 }).toString(),
                    companyLink: faker.internet.url(),
                    about: faker.lorem.paragraph(),
                    language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de', 'it', 'zh']),
                    tagline: faker.company.catchPhrase(),
                    industry: faker.commerce.department(),
                    services: faker.commerce.productDescription(),
                    resumeLink: faker.internet.url(),
                    linkedinLink: `https://linkedin.com/in/${faker.internet.username()}`,
                    rating: faker.number.int({ min: 1, max: 5 }),
                },
            },
            Location: {
                create: {
                    city: faker.location.city(),
                    state: faker.location.state(),
                    country: faker.location.country(),
                    address: faker.location.streetAddress(),
                    postalCode: 123,
                }
            }
        },
    });

    console.log("EMPLOYER user and profile created:", user);

    // Seed job posts associated with the created user
    const jobPost1 = await prisma.jobPost.create({
        data: {
            randomId: "A1B2C3",
            jobTitle: "Senior Software Engineer",
            companyName: "Tech Innovators Inc.",
            location: "San Francisco, CA",
            description:
                "We are looking for a Senior Software Engineer to join our team. You will work on cutting-edge technologies and deliver exceptional results.",
            applicationLink: "https://example.com/apply/12345",
            companyIcon: "https://example.com/icons/tech-innovators.png",
            time: "3hr",
            jobType: "FULL_TIME",
            salary: "120000-150000 USD/year",
            minPrice: 12000,
            maxPrice: 15000,
            userId: user.id,
            status: "OPEN",
        },
    });

    const jobPost2 = await prisma.jobPost.create({
        data: {
            randomId: "D4E5F6",
            jobTitle: "Marketing Specialist",
            companyName: "Bright Future Co.",
            location: "New York, NY",
            description:
                "Join Bright Future Co. as a Marketing Specialist and play a key role in driving our marketing strategy forward.",
            applicationLink: "https://example.com/apply/67890",
            time: "8hr",
            jobType: "PART_TIME",
            salary: "60000-80000 USD/year",
            minPrice: 6000,
            maxPrice: 8000,
            userId: user.id,
            status: "OPEN",
        },
    });

    console.log("Job posts seeded successfully.");

    // Seed 'SaveJobpost' to simulate users saving jobs
    await prisma.saveJobpost.createMany({
        data: [
            {
                jobId: jobPost1.id, // Saved job for 'Senior Software Engineer'
                userId: user.id,
            },
            {
                jobId: jobPost2.id, // Saved job for 'Marketing Specialist'
                userId: user.id,
            },
        ],
    });

    console.log("Jobs saved successfully.");

    // Seed 'JobApplied' to simulate users applying for jobs
    await prisma.jobApplied.createMany({
        data: [
            {
                jobId: jobPost1.id, // Applied job for 'Senior Software Engineer'
                userId: user.id,
                appliedDate: new Date(),
                status: "IN_PROGRESS",
            },
            {
                jobId: jobPost2.id, // Applied job for 'Marketing Specialist'
                userId: user.id,
                appliedDate: new Date(),
                status: "IN_PROGRESS",
            },
        ],
    });

    console.log("Jobs applied successfully.");
}

main()
    .catch((e) => {
        console.error("Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
