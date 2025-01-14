const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Generate unique email addresses for each user
    const recruiterEmail = `recruiter_${Date.now()}@example.com`;
    const employerEmail = `employer_${Date.now() + 1}@example.com`;

    // Create test Users and Profiles
    const recruiterUser = await prisma.user.create({
        data: {
            email: recruiterEmail,
            password: "securepassword",
            role: "RECRUITER",
            Profile: {
                create: {
                    fullname: "John Doe",
                },
            },
        },
    });

    const employerUser = await prisma.user.create({
        data: {
            email: employerEmail,
            password: "securepassword",
            role: "EMPLOYER",
            Profile: {
                create: {
                    companyName: "espstack",
                },
            },
        },
    });

    // Create a RecruiterHiring record
    const recruiterHiring = await prisma.recruiterHiring.create({
        data: {
            employerId: employerUser.id,
            recruiterId: recruiterUser.id,
            adminApprovalStatus: "PENDING", // Example status value
            recruiterApprovalStatus: "PENDING", // Add this status value
            paymentStatus: "PENDING",
            jobStatus: "OPEN", // Add a valid jobStatus value
        },
    });

    // Create a Timesheet record
    await prisma.timeSheet.create({
        data: {
            recruitingId: recruiterHiring.id,
            totalHourWorked: 40,
            totalAmountDue: 5000,
            totalPayableAmount: 4500,
            approvalStatusEmp: "PENDING",
            recruiterName: "John Doe",
        },
    });

    console.log("Seeding complete!");
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error("Error seeding database:", e);
        prisma.$disconnect();
        process.exit(1);
    });
