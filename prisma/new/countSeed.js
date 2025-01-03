const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    // Create Users
    const user1 = await prisma.user.create({
        data: {
            email: 'recruiterfeef@example.com',
            password: 'password123',
            role: 'RECRUITER',
            isActive: true,
            isAdmin: false,
            Profile: {
                create: {
                    fullname: 'Recruiter One',
                    location: 'New York',
                    about: 'Experienced recruiter in the tech industry',
                },
            },
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'employer1efff@example.com',
            password: 'password123',
            role: 'EMPLOYER',
            isActive: true,
            isAdmin: false,
            Profile: {
                create: {
                    fullname: 'Employer One',
                    location: 'California',
                    companyName: 'Tech Solutions Inc.',
                },
            },
        },
    });

  

    const recruiterHiring1 = await prisma.recruiterHiring.create({
        data: {
            employerId: user2.id,
            recruiterId: user1.id,
            adminApprovalStatus: HiringStatusAdmin.APPROVED, // Use the imported enum value
            recruiterApprovalStatus: HiringStatusRec.APPROVED, // Use the imported enum value
            jobStatus: JobStatus.ACTIVE, // Use the imported enum value
            paymentStatus: PaymentStatus.PENDING, // Use the imported enum value
            invoice: 'INV001',
            paidOn: new Date(),
            timeSheets: {
                create: [
                    {
                        totalHourWorked: 40,
                        totalAmountDue: 1000,
                        totalPayableAmount: 1000,
                        approvalStatusEmp: 'APPROVED',
                        weeklyTimesheet: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
            },
            hiredServices: {
                create: [
                    {
                        serviceId: 1, // Service ID, you would need to create this service as well
                        jobDetail: 'Hiring a software engineer for a project.',
                        startDate: new Date(),
                        endDate: new Date(),
                    },
                ],
            },
            TimesheetReview: {
                create: [
                    {
                        content: 'Great job! Delivered as expected.',
                        rating: 5,
                    },
                ],
            },
        },
    });

    // Create a Service (Example)
    const service = await prisma.service.create({
        data: {
            name: 'Software Development',
            description: 'Full stack development services.',
        },
    });

    // Create HiredService for a specific recruiter hiring
    await prisma.hiredService.create({
        data: {
            hiredRecruiterId: recruiterHiring1.id,
            serviceId: service.id,
            jobDetail: 'Developing a new application for the client.',
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    console.log('Seeding complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
