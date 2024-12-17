const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUsers() {
    try {
        // Seed Admin
        /*       await prisma.user.create({
                   data: {
                       email: "admin1@example.com",
                       password: "admin123",
                       role: "ADMIN",
                       isAdmin: true,
                       firstLogin: false,
                       isActive: true,
                   },
               });
       
               // Seed Staff Member
               await prisma.user.create({
                   data: {
                       email: "staffmember1@example.com",
                       password: "staff123",
                       role: "STAFF_MEMBER", // Ensure that STAFF_MEMBER is defined in your UserRole enum
                       isAdmin: false,
                       firstLogin: true,
                       isActive: true,
                   },
               });
       
               // Seed Mentor
               const mentor = await prisma.user.create({
                   data: {
                       email: "mentor1@example.com",
                       password: "mentor123",
                       role: "MENTOR",
                       resume: "Resume link for Mentor",
                       isAdmin: false,
                       firstLogin: true,
                       isActive: true,
                       Profile: {
                           create: {
                               fullname: "John Doe",
                               phnumber: "1234567890",
                               tagline: "Experienced Career Mentor",
                               about: "Helping job seekers excel in interviews.",
                           },
                       },
                   },
               });
       
               // Create Services for the Mentor
               await prisma.service.createMany({
                   data: [
                       {
                           name: "Resume Review",
                           description: "Detailed review and feedback on your resume.",
                           pricing: 100,
                           mentorId: mentor.id,
                       },
                       {
                           name: "Interview Preparation",
                           description: "Mock interview sessions with detailed feedback.",
                           pricing: 200,
                           mentorId: mentor.id,
                       },
                   ],
               });
       
               console.log("Services created for mentor");
       
               // Seed Job Seeker
               const jobSeeker = await prisma.user.create({
                   data: {
                       email: "jobseeker1@example.com",
                       password: "jobseeker123",
                       role: "JOB_SEEKER",
                       resume: "Resume link for Job Seeker",
                       isAdmin: false,
                       firstLogin: true,
                       isActive: true,
                       Profile: {
                           create: {
                               fullname: "Jane Doe",
                               phnumber: "9876543210",
                           },
                       },
                   },
               });
       */
               // Create Session Booking for Job Seeker
           const booking=     await prisma.mentorSessionManagement.create({
                   data: {
                       selectedService: 1, // Assume this is the ID of "Resume Review"
                       selectedDateTime: new Date(), // Current time for example
                       status: "ACCEPTED",
                       userId: 4,
                       mentorProfileId: 11,
                       paymentStatus: "COMPLETED",
                   },
               });
               
/*
        //console.log("Session Booking created:", sessionBooking);

        // First, create a notification
        const notification = await prisma.notification.create({
            data: {
                title: "Session Completed", // Example title
                message: "Your mentorship session with Mentor John has been completed. Please leave a review.", // Example message
                userId: 4, // Assuming this is the ID of the job seeker
                mentorId: 3, // Assuming this is the ID of the mentor
            },
        });

        console.log("Notification created:", notification);

        // Then, create the review with the notification ID
        const review = await prisma.review.create({
            data: {
                content: "Great session! The mentor was very helpful and provided valuable feedback.", // Review content
                rating: 5, // Rating between 1 and 5
                notificationId: notification.id, // Link the review to the created notification
                mentorSessionManagementId: 1, // The ID of the mentor session, update with the actual ID
            },
        });

        console.log("Review created:", review);


        
                // Seed Employer
                await prisma.user.create({
                    data: {
                        email: "employer1@example.com",
                        password: "employer123",
                        role: "EMPLOYER",
                        isAdmin: false,
                        firstLogin: true,
                        isActive: true,
                        Profile: {
                           create: {
                               fullname: "Jane Doe",
                               phnumber: "9876543210",
                           },
                       },
                    },
                });
                
        
                // Seed Recruiter
            await prisma.user.create({
                    data: {
                        email: "recruiter11@example.com",
                        password: "recruiter123",
                        role: "RECRUITER",
                        isAdmin: false,
                        firstLogin: true,
                        isActive: true,
                        Profile: {
                           create: {
                               fullname: "Jane Doe",
                               phnumber: "9876543210",
                               
                               
                           },
                       },
                       Location:{
                       create:{
                       city: "New York",
                            state: "New York",
                            country: "USA",
                            address: "123 5th Ave, Apt 12B",
                            postalCode: 10001,
                            userId: 14, // Assuming mentor has userId 1, adjust accordingly
                            }}
                       
                    },
                });
        /*
                // Create Locations
                const location = await prisma.location.createMany({
                    data: [
                        {
                            city: "New York",
                            state: "New York",
                            country: "USA",
                            address: "123 5th Ave, Apt 12B",
                            postalCode: 10001,
                            userId: mentor.id, // Assuming mentor has userId 1, adjust accordingly
                        },
                        {
                            city: "Los Angeles",
                            state: "California",
                            country: "USA",
                            address: "456 Sunset Blvd, Suite 8",
                            postalCode: 90028,
                            userId: jobSeeker.id, // Assuming jobSeeker has userId 2, adjust accordingly
                        },
                    ],
                });
        
                console.log("Locations created:", location);
        
                console.log("Users and data seeded successfully!");
                */
    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUsers();
