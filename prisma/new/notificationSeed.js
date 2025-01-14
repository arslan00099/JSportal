const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    await prisma.adminNotification.createMany({
        data: [
            {
                title: 'Timesheet Approved',
                message: 'Your timesheet has been approved by the admin.',
                senderId: 1,
                timesheetId: 1,
                actionButtons: JSON.stringify(['View']),
            },
            {
                title: 'New Timesheet Submission',
                message: 'A new timesheet has been submitted for review.',
                senderId: 2,
                timesheetId: 2,
                actionButtons: JSON.stringify(['Review']),
            },
            {
                title: 'Action Required',
                message: 'Please provide additional information for your timesheet.',
                senderId: 3,
                timesheetId: 3,
                actionButtons: JSON.stringify(['Respond']),
            },
        ],
    });
    console.log('Seed data added for AdminNotification');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
