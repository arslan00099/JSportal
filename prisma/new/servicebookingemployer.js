const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedServiceAndBookings() {
    try {
        // Create Services
        const services = await prisma.service.createMany({
            data: [
                {
                    name: 'Mock Interview Preparation',
                    description: 'Comprehensive mock interview session to help you prepare for your dream job.',
                    pricing: 500,
                    mentorId: 6 // Assuming the recruiter (user ID 14) is also a mentor
                },
                {
                    name: 'Resume Review',
                    description: 'Detailed review and optimization of your professional resume.',
                    pricing: 300,
                    mentorId: 6
                },
                {
                    name: 'Career Counseling',
                    description: 'One-on-one career guidance and strategic planning session.',
                    pricing: 750,
                    mentorId: 6
                },
                {
                    name: 'LinkedIn Profile Optimization',
                    description: 'Professional enhancement of your LinkedIn profile to attract recruiters.',
                    pricing: 250,
                    mentorId: 6
                }
            ]
        });

        // Fetch the created services to get their IDs
        const createdServices = await prisma.service.findMany({
            where: {
                mentorId: 6
            }
        });

        // Create Bookings for employer (ID: 13) with various services
        const bookings = await prisma.booking.createMany({
            data: [
                {
                    selectedService: createdServices[0].id, // Mock Interview Preparation
                    selectedDateTime: new Date('2024-02-15T10:00:00Z'),
                    status: 'ACCEPTED',
                    employerId: 5,
                    recId: 6,
                    paymentStatus: 'COMPLETED'
                },
                {
                    selectedService: createdServices[1].id, // Resume Review
                    selectedDateTime: new Date('2024-02-20T14:30:00Z'),
                    status: 'ACCEPTED',
                    employerId: 5,
                    recId: 6,
                    paymentStatus: 'COMPLETED'
                },
                {
                    selectedService: createdServices[2].id, // Career Counseling
                    selectedDateTime: new Date('2024-03-05T16:00:00Z'),
                    status: 'ACCEPTED',
                    employerId: 5,
                    recId: 6,
                    paymentStatus: 'COMPLETED'
                },
                {
                    selectedService: createdServices[3].id, // LinkedIn Profile Optimization
                    selectedDateTime: new Date('2024-03-10T11:15:00Z'),
                    status: 'ACCEPTED',
                    employerId: 5,
                    recId: 6,
                    paymentStatus: 'COMPLETED'
                }
            ]
        });

        console.log('Successfully seeded Services and Bookings:');
        console.log('Services created:', services);
        console.log('Bookings created:', bookings);

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the seeding function
seedServiceAndBookings()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });