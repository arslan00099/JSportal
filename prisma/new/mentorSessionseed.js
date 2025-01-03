const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Mentor Profile
  const mentor = await prisma.user.create({
    data: {
      
      email: 'mentor11@example.com',
      password : 'secure1233',
      role: 'MENTOR',
      Profile: {
        create: {
            fullname: 'kkmentor',
        },
    },
    services: {
        create: [
          {
            name: 'Career Guidance',
            description: 'Help with career planning and advice.',
            pricing: 100,
          },
          {
            name: 'Technical Interview Prep',
            description: 'Prepare for technical interviews.',
            pricing: 150,
          },
        ],
      },
    },
    include: { services: true }, // Include created services
  });

  console.log('Mentor created:', mentor);

  // 2. Create Job Seekers
  const jobSeekers = await Promise.all(
    ['Alice', 'Bob', 'Charlie'].map((name, index) =>
      prisma.user.create({
        data: {
          email: `${name.toLowerCase()}@example.com`,
          role: 'JOB_SEEKER',
          password : 'secure1233',
        },
      })
    )
  );

  console.log('Job seekers created:', jobSeekers);

  // 3. Book Sessions
  const bookings = await Promise.all(
    jobSeekers.map((jobSeeker, index) =>
      prisma.mentorSessionManagement.create({
        data: {
          userId: jobSeeker.id,
          mentorProfileId: mentor.id,
          selectedService: mentor.Service[index % mentor.Service.length].id, // Alternate services
          selectedDateTime: new Date(Date.now() + index * 86400000), // Sessions on different days
          status: 'ACCEPTED',
        },
        include: { Service: true }, // Include service details
      })
    )
  );

  console.log('Bookings created:', bookings);

  // 4. Add Reviews for Sessions
  const reviews = await Promise.all(
    bookings.map((booking, index) =>
      prisma.review.create({
        data: {
          content: `Review content for session ${index + 1}`,
          rating: 4 + (index % 2), // Alternating ratings
          mentorSessionManagementId: booking.id,
        },
      })
    )
  );

  console.log('Reviews created:', reviews);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
