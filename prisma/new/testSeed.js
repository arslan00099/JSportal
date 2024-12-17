const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Create the Location
    // await prisma.location.create({
    //     data: {
    //         city: "New York",
    //         state: "NY",
    //         country: "USA",
    //         address: "123 Main Street",
    //         postalCode: 10001,
    //         userId: 4, // Ensure userId 14 exists in the User model
    //     },
    // });

    // console.log("Seed completed for Location with userId 14");

    // Create the Profile
    await prisma.profile.create({
        data: {
            userId: 11, // Same userId as the Location
            fullname: "John Doe Mentor",
            phnumber: "+1234567890",
            mentorvideolink: "https://example.com/video",
            avatarId: "avatar_12345",
            location: "New York, USA",
            companyName: "Tech Corp",
            companySize: "100-500",
            companyLink: "https://techcorp.com",
            about: "Experienced software developer with expertise in IoT and backend systems.",
            language: "English,Urdu",
            tagline: "Building the future, one line of code at a time.",
            industry: "Technology",
            services: "Software Development, IoT Solutions",
            resumeLink:"www.google.com",
            rating: 5,
        },
    });

    console.log("Seed completed for Profile with userId 14");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
