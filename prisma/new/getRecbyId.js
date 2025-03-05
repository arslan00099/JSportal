const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Hash password
   
    // Create users with mentor profiles
    const user1 = await prisma.user.create({
        data: {
            email: 'mentor1@example.com',
            password: "123123",
            role: 'RECRUITER',
            Profile: {
                create: {
                    fullname: 'John Doe',
                    tagline: 'Experienced career coach',
                    about: 'Helping professionals grow in their careers.',
                    language: 'English, Spanish',
                    rating: 4.8,
                    totalReview: 120,
                    location: 'New York, USA',
                    yearOfExperience: 10,
                    companyLink: 'https://linkedin.com/in/johndoe'
                }
            }
        }
    });

    // Create services linked to the mentor
    const services = await prisma.service.createMany({
        data: [
            { IndustryName: 'Career Development', name: 'Career Coaching', description: 'Guidance for career growth', pricing: 100, mentorId: user1.id },
            { IndustryName: 'Career Development', name: 'Resume Review', description: 'Professional resume review', pricing: 50, mentorId: user1.id },
            { IndustryName: 'Career Development', name: 'Interview Prep', description: 'Mock interviews and tips', pricing: 75, mentorId: user1.id },
            { IndustryName: 'Career Development', name: 'Job Search Strategy', description: 'Help with job search planning', pricing: 90, mentorId: user1.id },
            { IndustryName: 'Tech', name: 'Software Engineering Mentorship', description: 'Guidance on software engineering career paths', pricing: 150, mentorId: user1.id },
            { IndustryName: 'Business', name: 'Entrepreneurship Coaching', description: 'Learn how to start and grow your business', pricing: 200, mentorId: user1.id }
        ]
    });

    console.log(`Created user: ${user1.email} with services`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });