const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Step 1: Create a User
    const user = await prisma.user.create({
        data: {
            email: "johndoe@example.com",
            password: "securepassword", // You might want to hash the password in a real app
            role: "MENTOR",  // Assuming 'MENTOR' is a valid UserRole
            isActive: true,
            isAdmin: false,
            firstLogin: true,
        },
    });

    console.log('User created:', user);

    // Step 2: Create a MentorProfile associated with the User
    const mentorProfile = await prisma.mentorProfile.create({
        data: {
            name: "John Doe",
            tagline: "Expert Mentor",
            about: "Experienced software engineer specializing in web development.",
            languages: "English",
            rating: 5,
            totalReview: 10,
            userId: user.id,  // Link the MentorProfile to the User via userId
            linkedinProfile: "https://linkedin.com/in/johndoe",
            industry: "Technology",
            discipline: "Software Development",
            location: "Remote",
            yearOfExperience: 10,
        },
    });

    console.log('MentorProfile created:', mentorProfile);

    // Step 3: Create Service records associated with the MentorProfile
    await prisma.service.createMany({
        data: [
            {
                name: "Resume Review",
                description: "Detailed review and suggestions for your resume.",
                pricing: 50,
                mentorId: mentorProfile.userId,  // Link to MentorProfile via mentorId
            },
            {
                name: "Mock Interview",
                description: "Practice interviews to help you prepare for your dream job.",
                pricing: 100,
                mentorId: mentorProfile.userId,  // Link to MentorProfile via mentorId
            },
        ],
    });

    console.log('Services created for the mentor profile');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
