// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Step 1: Create multiple Users (employers and recruiters)
    const employers = [
        { email: 'employer11@example.com', fullname: 'Employer 11' },
        { email: 'employer12@example.com', fullname: 'Employer 12' },
    ];

    const recruiters = [
        { email: 'recruiter11@example.com', fullname: 'Recruiter 11' },
        { email: 'recruiter12@example.com', fullname: 'Recruiter 12' },
    ];

    const employerRecords = await Promise.all(
        employers.map((employer) =>
            prisma.user.create({
                data: {
                    email: employer.email,
                    password: 'securepassword',
                    role: 'EMPLOYER',
                    Profile: {
                        create: {
                            fullname: employer.fullname,
                        },
                    },
                },
            })
        )
    );

    const recruiterRecords = await Promise.all(
        recruiters.map((recruiter) =>
            prisma.user.create({
                data: {
                    email: recruiter.email,
                    password: 'securepassword',
                    role: 'RECRUITER',
                    Profile: {
                        create: {
                            fullname: recruiter.fullname,
                        },
                    },
                },
            })
        )
    );

    // Step 2: Create multiple RecruiterHiring records
    const recruiterHirings = await Promise.all(
        employerRecords.map((employer, index) => {
            return prisma.recruiterHiring.create({
                data: {
                    adminApprovalStatus: 'PENDING',
                    recruiterApprovalStatus: 'PENDING',
                    jobStatus: 'OPEN',
                    paymentStatus: 'PENDING',
                    employerId: employer.id,
                    recruiterId: recruiterRecords[index].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        })
    );

    // Step 3: Create multiple TimesheetReview records for each RecruiterHiring
    const timesheetReviews = await Promise.all(
        recruiterHirings.map((recruiterHiring) => {
            return prisma.timesheetReview.create({
                data: {
                    content: 'Great performance. Could improve communication skills.',
                    rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
                    recruiterHiringId: recruiterHiring.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        })
    );

    console.log('Multiple seed data inserted successfully!');
}

// Run the seed script
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
