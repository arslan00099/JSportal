const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const { subDays } = require('date-fns');


exports.getDashboard = async (req, res) => {
    try {
        // Fetch counts for different user roles
        const [mentorCount, employeeCount, jobSeekerCount, recruiterCount] = await Promise.all([
            prisma.user.count({ where: { role: "MENTOR" } }),
            prisma.user.count({ where: { role: "EMPLOYER" } }),
            prisma.user.count({ where: { role: "JOB_SEEKER" } }),
            prisma.user.count({ where: { role: "RECRUITER" } }),
        ]);

        // Transform data for better readability
        const formattedResponse = {
            employeesCount: employeeCount,
            jsCount: jobSeekerCount,
            recCount: recruiterCount,
            mentorCount: mentorCount,
            mentorRev: "$200",
            recRev: "$300",
            jsRev: "$200",
            cvRev: "$500",
        };

        // Send response
        res.status(200).json({
            success: true,
            data: formattedResponse,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data.",
            error: error.message,
        });
    }
};


exports.getAllMentors = async (req, res) => {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition with optional search
        const whereCondition = {
            user: {
                role: "MENTOR",
            },
            ...(searchQuery && {
                fullname: {
                    contains: searchQuery, // Remove 'mode' parameter
                }
            })
        };

        // Fetch data from MentorProfile and related User table with pagination, sorting, and search
        const mentors = await prisma.profile.findMany({
            where: whereCondition,
            include: {
                user: {
                    include: {
                        Location: true,
                    },
                },
            },
            orderBy: {
                id: sortOrder
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of mentors for pagination (with search filter)
        const totalMentors = await prisma.profile.count({
            where: whereCondition,
        });

        // Transform data into required format
        const formattedMentors = mentors.map((mentor, index) => ({
            userId: mentor.id,
            name: mentor.fullname,
            email: mentor.user.email,
            phoneNo: mentor.phnumber,
            address: mentor.user.Location.length > 0 ? mentor.user.Location[0]?.city : "N/A",
            ratings: mentor.rating || 0,
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalMentors / pageSize);

        res.status(200).json({
            mentors: formattedMentors,
            pagination: {
                totalItems: totalMentors,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
                searchQuery: searchQuery,
            },
        });
    } catch (error) {
        console.error('Error fetching mentor data:', error);
        res.status(500).json({ error: 'An error occurred while fetching mentor data.' });
    }
};


exports.getAllJS = async (req, res) => {
    try {
        console.log("getting all the JS list");
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition with optional search
        const whereCondition = {
            user: {
                role: "JOB_SEEKER",
            },
            ...(searchQuery && {
                fullname: {
                    contains: searchQuery,
                }
            })
        };

        // Fetch data from Profile and related User table with pagination, sorting, and search
        const jobSeekers = await prisma.profile.findMany({
            where: whereCondition,
            select: {
                id: true,
                fullname:true,
                resumeLink: true,
                user: {
                    include: {
                        Location: true,
                    },
                },
            },
            orderBy: {
                id: sortOrder
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of job seekers for pagination (with search filter)
        const totalJobSeekers = await prisma.profile.count({
            where: whereCondition,
        });

        // Transform data into required format
        const formattedJobSeekers = jobSeekers.map((seeker, index) => ({
            userId: seeker.id,
            name: seeker.fullname,
            email: seeker.user.email,
            phoneNo: seeker.phnumber,
            city: seeker.user.Location.length > 0 ? seeker.user.Location[0]?.city : "N/A",
            state: seeker.user.Location.length > 0 ? seeker.user.Location[0]?.state : "N/A",
            resumeLink: seeker.resumeLink,

        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalJobSeekers / pageSize);

        res.status(200).json({
            jobSeekers: formattedJobSeekers,
            pagination: {
                totalItems: totalJobSeekers,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
                searchQuery: searchQuery,
            },
        });
    } catch (error) {
        console.error('Error fetching job seeker data:', error);
        res.status(500).json({ error: 'An error occurred while fetching job seeker data.' });
    }
};



exports.getAllMentorBookings = async (req, res) => {
    const { userId } = req.params; // Get the userId from params

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Get sorting parameter
    const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    try {
        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Fetch the sessions for the given userId, including mentor and profile data
        const sessions = await prisma.mentorSessionManagement.findMany({
            where: {
                mentorProfileId: parseInt(userId), // Use the userId to query sessions
            },
            orderBy: {
                id: sortOrder // Sort by ID in specified order
            },
            skip: skip,
            take: take,
            select: {
                id: true, // Fetch session id
                status: true, // Fetch session status
                mentor: {
                    select: {
                        email: true, // Fetch mentor's email
                        Profile: {
                            select: {
                                id: true, // Fetch Profile id
                                fullname: true, // Fetch Profile full name
                                phnumber: true, // Fetch Profile phone number
                            },
                        },
                        Location: {
                            select: {
                                city: true, // Fetch city from location
                                state: true, // Fetch state from location
                            },
                        },
                    },
                },
            },
        });

        // Count total number of sessions for this mentor
        const totalSessions = await prisma.mentorSessionManagement.count({
            where: {
                mentorProfileId: parseInt(userId),
            },
        });

        if (sessions.length === 0) {
            return res.status(404).json({ message: 'No sessions found for this mentor' });
        }

        // Flatten the response data
        const flattenedData = sessions.map(session => {
            const profile = session.mentor.Profile[0] || {}; // Access the first Profile
            const location = session.mentor.Location[0] || {}; // Access the first Location

            return {
                bookingId: session.id,
                fullName: profile.fullname || null,
                email: session.mentor.email,
                phNumber: profile.phnumber || null,
                state: location.state || null,
                city: location.city || null,
                bookingStatus: session.status,
            };
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalSessions / pageSize);

        // Send the flattened data in the response
        res.status(200).json({
            bookings: flattenedData,
            pagination: {
                totalItems: totalSessions,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
/*
exports.getAllJSBookings = async (req, res) => {
    const { userId } = req.params; // Get the userId from params

    try {
        // Fetch the sessions for the given userId, including mentor and profile data
        const sessions = await prisma.mentorSessionManagement.findMany({
            where: {
                userId: parseInt(userId), // Use the userId to query sessions
            },
            select: {
                id: true, // Fetch session id
                status: true, // Fetch session status
                user: {
                    select: {
                        email: true, // Fetch mentor's email
                        Profile: {
                            select: {
                                id: true, // Fetch Profile id
                                fullname: true, // Fetch Profile full name
                                phnumber: true, // Fetch Profile phone number
                            },
                        },
                        Location: {
                            select: {
                                city: true, // Fetch city from location
                                state: true, // Fetch state from location
                            },
                        },
                    },
                },
            },
        });

        // Check if sessions are found
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: 'No sessions found for this mentor' });
        }

        // Flatten the response data
        const flattenedData = sessions.map(session => {
            const user = session.user || {}; // Safeguard against undefined user
            const profile = (user.Profile && user.Profile[0]) || {}; // Safeguard Profile
            const location = (user.Location && user.Location[0]) || {}; // Safeguard Location

            return {
                bookingId: session.id,
                fullName: profile.fullname || null,
                email: user.email || null,
                phNumber: profile.phnumber || null,
                state: location.state || null,
                city: location.city || null,
                bookingStatus: session.status,  
            };
        });

        // Send the flattened data in the response
        res.status(200).json(flattenedData);
    } catch (error) {
        console.error("Error in getAllJSBookings:", error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
*/


exports.getMentorReviewsOLD = async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch all reviews related to the mentorProfileId
        const reviews = await prisma.review.findMany({
            where: {
                mentorSessionManagement: {
                    mentorProfileId: parseInt(userId), // Make sure mentorProfileId is an integer
                },
            },

            include: {
                mentorSessionManagement: {
                    include: {
                        user: {
                            select: {
                                email: true, // Fetch mentor's email
                                Profile: {
                                    select: {
                                        id: true, // Fetch Profile id
                                        fullname: true, // Fetch Profile full name
                                        avatarId: true, // Fetch Profile avatarId
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this mentor.' });
        }

        // Map the reviews to the required structure
        const simplifiedReviews = reviews.map(review => ({
            content: review.content,
            rating: review.rating,
            fullname: review.mentorSessionManagement.user.Profile[0]?.fullname, // Access the first element if Profile is an array
            avatarId: review.mentorSessionManagement.user.Profile[0]?.avatarId, // Same here
        }));

        // Return the reviews as a response
        return res.status(200).json(simplifiedReviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
};



exports.getMentorReviews = async (req, res) => {
    const { userId } = req.params;

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Get filter and sorting parameters
    const filter = req.query.filter?.toLowerCase();

    try {
        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition based on filter
        const whereCondition = {
            mentorSessionManagement: {
                mentorProfileId: parseInt(userId),
            }
        };

        // Apply time-based filtering if specified
        if (filter === 'latest') {
            // Filter reviews from the last 3 days
            whereCondition.createdAt = {
                gte: subDays(new Date(), 3)
            };
        }

        // Fetch reviews with filtering, pagination, and sorting
        const reviews = await prisma.review.findMany({
            where: whereCondition,
            include: {
                mentorSessionManagement: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                Profile: {
                                    select: {
                                        id: true,
                                        fullname: true,
                                        avatarId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            // Sorting based on filter
            orderBy: {
                createdAt: filter === 'earliest' ? 'asc' : 'desc'
            },
            skip: skip,
            take: take,
        });

        // Count total reviews with the same filtering condition
        const totalReviews = await prisma.review.count({
            where: whereCondition
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this mentor.' });
        }

        // Map the reviews to the required structure
        const simplifiedReviews = reviews.map(review => ({
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
            fullname: review.mentorSessionManagement.user.Profile[0]?.fullname,
            avatarId: review.mentorSessionManagement.user.Profile[0]?.avatarId,
        }));

        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / pageSize);

        // Return the reviews with pagination metadata
        return res.status(200).json({
            reviews: simplifiedReviews,
            pagination: {
                totalItems: totalReviews,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                filter: filter || 'default'
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
};

exports.getAllEmployers = async (req, res) => {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition with optional search
        const whereCondition = {
            user: {
                role: "EMPLOYER",
            },
            ...(searchQuery && {
                fullname: {
                    contains: searchQuery, // Remove 'mode' parameter
                },
                companyName: true,
            })
        };

        // Fetch data from MentorProfile and related User table with pagination, sorting, and search
        const mentors = await prisma.profile.findMany({
            where: whereCondition,
            include: {
                user: {
                    include: {
                        Location: true,
                    },
                },
            },
            orderBy: {
                id: sortOrder
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of mentors for pagination (with search filter)
        const totalMentors = await prisma.profile.count({
            where: whereCondition,
        });

        // Transform data into required format
        const formattedMentors = mentors.map((mentor, index) => ({
            userId: mentor.user.id,
            companyName: mentor.companyName,
            name: mentor.fullname,
            email: mentor.user.email,
            phoneNo: mentor.phnumber,
            address: mentor.user.Location.length > 0 ? mentor.user.Location[0]?.city : "N/A",
            purchasedPlan: 1
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalMentors / pageSize);

        res.status(200).json({
            Employers: formattedMentors,
            pagination: {
                totalItems: totalMentors,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
                searchQuery: searchQuery,
            },
        });
    } catch (error) {
        console.error('Error fetching mentor data:', error);
        res.status(500).json({ error: 'An error occurred while fetching mentor data.' });
    }
};

exports.getEmployerBookings = async (req, res) => {
    const { userId } = req.params;
    console.log("GETTING EMPLOYER BOOKINGS");

    try {
        // Query the database to fetch the required details
        const bookings = await prisma.booking.findMany({
            where: {
                employerId: parseInt(userId),
            },
            select: {
                id: true, // bookingId
                employer: {
                    select: {
                        Profile: {
                            select: {
                                companyName: true,
                                phnumber: true,
                                fullname: true,
                            },
                        },
                        email: true,
                        Location: {
                            select: {
                                state: true,
                                city: true,
                            },
                        },
                    },
                },
                recruiter: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true, // recruiterName
                            },
                        },
                    },
                },
                Service: {
                    select: {
                        name: true, // recruiterService
                    },
                },
            },
        });

        // Map and format the data to match the required structure
        const formattedBookings = bookings.map((booking) => {
            const employerProfile = booking.employer.Profile?.[0] || booking.employer.Profile; // Handle array or object
            const location = booking.employer.Location;

            return {
                bookingId: booking.id,
                companyName: employerProfile?.companyName || null,
                email: booking.employer.email,
                phnumber: employerProfile?.phnumber || null,
                employerName: employerProfile?.fullname || null,
                state: booking.employer.Location[0].state,
                city: booking.employer.Location[0].city,
                recruiterName: booking.recruiter?.Profile?.[0]?.fullname || booking.recruiter?.Profile?.fullname || null,
                recruiterService: booking.Service?.name || null,
            };
        });

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Error fetching employer bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllRec = async (req, res) => {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition with optional search
        const whereCondition = {
            user: {
                role: "RECRUITER",
            },
            ...(searchQuery && {
                fullname: {
                    contains: searchQuery, // Remove 'mode' parameter
                }
            })
        };

        // Fetch data from MentorProfile and related User table with pagination, sorting, and search
        const mentors = await prisma.profile.findMany({
            where: whereCondition,
            include: {
                user: {
                    include: {
                        Location: true,
                    },
                },
            },
            orderBy: {
                id: sortOrder
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of mentors for pagination (with search filter)
        const totalMentors = await prisma.profile.count({
            where: whereCondition,
        });

        // Transform data into required format
        const formattedMentors = mentors.map((mentor, index) => ({
            userId: mentor.id,
            name: mentor.fullname,
            email: mentor.user.email,
            phoneNo: mentor.phnumber,
            address: mentor.user.Location.length > 0 ? mentor.user.Location[0]?.city : "N/A",
            ratings: mentor.rating || 0,
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalMentors / pageSize);

        res.status(200).json({
            recruiter: formattedMentors,
            pagination: {
                totalItems: totalMentors,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
                searchQuery: searchQuery,
            },
        });
    } catch (error) {
        console.error('Error fetching mentor data:', error);
        res.status(500).json({ error: 'An error occurred while fetching mentor data.' });
    }
};

exports.getRecByid = async (req, res) => {
    const { userId } = req.params;
    console.log("userId will be here ");
    console.log(userId);

    try {
        // Fetch mentors with their services from related user
        const mentorsWithServices = await prisma.profile.findMany({
            where: { userId: parseInt(userId) },
            include: {
                user: {
                    include: {
                        services: true, // Fetch services for the user linked to the mentor profile
                    },
                },
            },
        });

        // Transform the data for better readability
        const formattedResponse = mentorsWithServices.map((mentor) => ({
            id: mentor.id,
            name: mentor.fullname,
            tagline: mentor.tagline,
            about: mentor.about,
            languages: mentor.language || [], // Default to empty array if no languages
            rating: mentor.rating || 0, // Default rating if missing
            totalReview: mentor.totalReview || 0, // Default total reviews if missing
            location: mentor.location || "Not provided", // Default location if missing
            yearOfExperience: mentor.yearOfExperience || 0, // Default experience if missing
            linkedinProfile: mentor.companyLink || "Not provided", // Default LinkedIn profile if missing
            services: mentor.user?.services || [], // Services linked to the mentor (from user)
        }));

        // Respond with the formatted data
        res.status(200).json({
            success: true,
            data: formattedResponse,
        });
    } catch (error) {
        console.error("Error fetching mentors with services:", error.message);

        // Send error response with more specific error information
        res.status(500).json({
            success: false,
            message: "Failed to fetch mentors with services.",
            error: error.message,
        });
    }
};


exports.getRecBookings = async (req, res) => {
    const { userId } = req.params;

    try {
        // Query the database to fetch the required details
        const bookings = await prisma.booking.findMany({
            where: {
                recId: parseInt(userId),
            },
            select: {
                id: true, // bookingId
                status: true,
                recruiter: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true,
                                phnumber: true,
                                location: true, // Assuming "state" and "city" are part of location
                                companyName: true,
                            },
                        },
                        email: true,
                    },
                },
                Service: {
                    select: {
                        name: true, // recruiterService
                    },
                },
            },
        });

        // Format the response
        const formattedBookings = bookings.map((booking) => {
            const recruiterProfile = booking.recruiter?.Profile?.[0]; // Ensure you're handling nested array correctly
            const locationParts = recruiterProfile?.location?.split(',') || [];

            return {
                bookingId: booking.id,
                status: booking.status,
                fullName: recruiterProfile?.fullname || null,
                email: booking.recruiter?.email || null,
                phnumber: recruiterProfile?.phnumber || null,
                state: locationParts[0]?.trim() || null,
                city: locationParts[1]?.trim() || null,
                timesheetCreatedAt: "june,14,2024",   //i have to adjust it

            };
        });

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error("Error in getRecBookings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUserAndProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate input
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Convert userId to an integer
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
            return res.status(400).json({ error: "Invalid userId format" });
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parsedUserId },
        });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete the user (this will also delete the associated profile due to cascade)
        await prisma.user.delete({
            where: { id: parsedUserId },
        });

        res.status(200).json({ message: "User and associated profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting user and profile:", error);
        res.status(500).json({ error: "An error occurred while deleting the user and profile" });
    }
};


//           ADD SERVICES AND OTHER THINGS  /////////
// Create an entry with duplicate name check
exports.createEntry = async (req, res) => {
    const { model, name } = { ...req.params, ...req.body };
    try {
      // Check if an entry with the same name already exists
      const existingEntry = await prisma[model].findFirst({
        where: { name },
      });
  
      if (existingEntry) {
        return res.status(400).json({ error: `${model} with name '${name}' already exists` });
      }
  
      const entry = await prisma[model].create({
        data: { name },
      });
  
      res.status(201).json(entry);
    } catch (error) {
      console.error(`Error creating ${model}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Update an entry with existence check
  exports.updateEntry = async (req, res) => {
    const { model, id } = { ...req.params, ...req.body };
    const { name } = req.body;
    try {
      // Check if the entry exists
      const existingEntry = await prisma[model].findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!existingEntry) {
        return res.status(404).json({ error: `${model} with ID ${id} not found` });
      }
  
      const updatedEntry = await prisma[model].update({
        where: { id: parseInt(id) },
        data: { name },
      });
  
      res.status(200).json(updatedEntry);
    } catch (error) {
      console.error(`Error updating ${model}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Delete an entry with existence check
  exports.deleteEntry = async (req, res) => {
    const { model, id } = { ...req.params, ...req.body };
    try {
      // Check if the entry exists
      const existingEntry = await prisma[model].findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!existingEntry) {
        return res.status(404).json({ error: `${model} with ID ${id} not found` });
      }
  
      await prisma[model].delete({
        where: { id: parseInt(id) },
      });
  
      res.status(200).json({ message: `${model} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${model}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Get all entries with pagination
  exports.getEntries = async (req, res) => {
    const { model } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default page 1, limit 10
  
    try {
      const skip = (page - 1) * limit;
  
      // Fetch total count
      const totalCount = await prisma[model].count();
  
      // Fetch paginated data
      const entries = await prisma[model].findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
      });
  
      res.status(200).json({
        data: entries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error(`Error fetching ${model}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  



















