const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const { subDays } = require('date-fns');
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");
const bcrypt = require('bcryptjs');


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
            mentorRev: "$0",
            recRev: "$0",
            jsRev: "$0",
            cvRev: "$0",
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
        console.log("Getting all Mentor list");

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition for search
        const userWhereCondition = {
            role: "MENTOR",
            ...(searchQuery && {
                OR: [
                    { email: { contains: searchQuery } },
                    { Profile: { some: { fullname: { contains: searchQuery } } } }
                ]
            })
        };

        // Fetch data from User with optional related Profile
        const mentor = await prisma.user.findMany({
            where: userWhereCondition,
            include: {
                Profile: true,
                Location: true,
                mentorSessions: {
                    include: {
                        reviews: {
                            select: {
                                rating: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: sortOrder,
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of job seekers for pagination
        const totalMentor = await prisma.user.count({
            where: userWhereCondition,
        });

        // Transform data into the required format
        const formattedMentor = mentor.map((user) => ({
            userId: user.id,
            name: user.Profile?.[0]?.fullname || null,
            email: user.email,
            phoneNo: user.Profile?.[0]?.phnumber || null,
            address: user.Location.length > 0 ? user.Location[0]?.city : "N/A",
            reviewsList: user.mentorSessions.flatMap(session =>
                session.reviews.map(review => review.rating)
            ) || null, // Flatten ratings from reviews
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalMentor / pageSize);

        res.status(200).json({
            mentors: formattedMentor,
            pagination: {
                totalItems: totalMentor,
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



exports.getAllJS = async (req, res) => {
    try {
        console.log("Getting all the Job Seeker list");

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition for search
        const userWhereCondition = {
            role: "JOB_SEEKER",
            ...(searchQuery && {
                OR: [
                    { email: { contains: searchQuery } },
                    { Profile: { some: { fullname: { contains: searchQuery } } } }
                ]
            })
        };

        // Fetch data from User with optional related Profile
        const jobSeekers = await prisma.user.findMany({
            where: userWhereCondition,
            include: {
                Profile: true,
                Location: true,
            },
            orderBy: {
                id: sortOrder,
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of job seekers for pagination
        const totalJobSeekers = await prisma.user.count({
            where: userWhereCondition,
        });

        // Transform data into the required format
        const formattedJobSeekers = jobSeekers.map((user) => ({
            userId: user.id,
            name: user.Profile?.[0]?.fullname || null,
            email: user.email,
            phoneNo: user.Profile?.[0]?.phnumber || null,
            city: user.Location.length > 0 ? user.Location[0]?.city : "N/A",
            state: user.Location.length > 0 ? user.Location[0]?.state : "N/A",
            resumeLink: generateResumeUrl(user.Profile?.[0]?.resumeLink) || null,
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


exports.getAllSF = async (req, res) => {
    try {
        console.log("Getting all the SF list");

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition for search
        const userWhereCondition = {
            role: "STAFF_MEMBER",
            ...(searchQuery && {
                OR: [
                    { email: { contains: searchQuery } },
                    { Profile: { some: { fullname: { contains: searchQuery } } } }
                ]
            })
        };

        // Fetch data from User with optional related Profile
        const jobSeekers = await prisma.user.findMany({
            where: userWhereCondition,
            include: {
                Profile: true,
                Location: true,
            },
            orderBy: {
                id: sortOrder,
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of job seekers for pagination
        const totalJobSeekers = await prisma.user.count({
            where: userWhereCondition,
        });

        // Transform data into the required format
        const formattedJobSeekers = jobSeekers.map((user) => ({
            userId: user.id,
            name: user.Profile?.[0]?.fullname || null,
            email: user.email,
            phoneNo: user.Profile?.[0]?.phnumber || null,
            city: user.Location.length > 0 ? user.Location[0]?.city : "N/A",
            state: user.Location.length > 0 ? user.Location[0]?.state : "N/A",
            resumeLink: generateResumeUrl(user.Profile?.[0]?.resumeLink) || null,
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalJobSeekers / pageSize);

        res.status(200).json({
            staffmember: formattedJobSeekers,
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
        console.error('Error fetching SF data:', error);
        res.status(500).json({ error: 'An error occurred while fetching SF data.' });
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
                bookingId: session.id || null,
                fullName: profile.fullname || null,
                email: session.mentor.email || null,
                phNumber: profile.phnumber || null,
                state: location.state || null,
                city: location.city || null,
                bookingStatus: session.status || null,
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

exports.updateMentorBookingStatus = async (req, res) => {
    const { bookingId } = req.params;  // Get bookingId from the URL parameter
    const { status } = req.body;  // Get the new status from the request body

    // Validate the new status to ensure it's one of the allowed values (e.g., 'Pending', 'Confirmed', 'Completed')
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'DECLINE'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Update the status of the booking in the database
        const updatedBooking = await prisma.mentorSessionManagement.update({
            where: {
                id: parseInt(bookingId),  // Ensure the bookingId is parsed as an integer
            },
            data: {
                status: status,  // Update the job status to the new value
            },
        });

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Return the updated booking information
        res.status(200).json({
            message: 'Booking status updated successfully',
            booking: {
                bookingId: updatedBooking.id,
                status: updatedBooking.jobStatus,
            },
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Internal server error' });
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
            avatarId: generateAvatarUrl(review.mentorSessionManagement.user.Profile[0]?.avatarId),
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
        console.log("Getting all the EMPLOYER list");

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition for search
        const userWhereCondition = {
            role: "EMPLOYER",
            ...(searchQuery && {
                OR: [
                    { email: { contains: searchQuery } },
                    { Profile: { some: { fullname: { contains: searchQuery } } } }
                ]
            })
        };

        // Fetch data from User with optional related Profile
        const jobSeekers = await prisma.user.findMany({
            where: userWhereCondition,
            include: {
                Profile: true,
                Location: true,
            },
            orderBy: {
                id: sortOrder,
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of job seekers for pagination
        const totalJobSeekers = await prisma.user.count({
            where: userWhereCondition,
        });

        // Transform data into the required format
        const formattedJobSeekers = jobSeekers.map((user) => ({
            userId: user.id,
            companyName: user.Profile?.[0]?.companyName || null,
            name: user.Profile?.[0]?.fullname || null,
            email: user.email,
            phoneNo: user.Profile?.[0]?.phnumber || null,
            address: user.Location.length > 0 ? user.Location[0]?.city : "N/A",
            purchasedPlan: 1,
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalJobSeekers / pageSize);

        res.status(200).json({
            Employers: formattedJobSeekers,
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

exports.getEmployerBookings = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'asc', search = '' } = req.query;

    console.log("GETTING EMPLOYER BOOKINGS");

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    try {
        // Fetch the bookings
        const bookings = await prisma.recruiterHiring.findMany({
            where: {
                employerId: parseInt(userId),
                employer: {
                    Profile: {
                        some: {
                            companyName: {
                                contains: search, // MySQL is case-insensitive by default
                            },
                        },
                    },
                },
            },
            take,
            skip,
            select: {
                id: true, // bookingId
                jobStatus: true,
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

        // Map and sort the data after fetching (since nested sorting is not supported directly)
        const formattedBookings = bookings
            .map((booking) => {
                const employerProfile = Array.isArray(booking.employer.Profile)
                    ? booking.employer.Profile[0]
                    : booking.employer.Profile;
                const location = Array.isArray(booking.employer.Location)
                    ? booking.employer.Location[0]
                    : booking.employer.Location;

                return {
                    bookingId: booking.id,
                    status: booking.jobStatus,
                    companyName: employerProfile?.companyName || null,
                    email: booking.employer.email,
                    phnumber: employerProfile?.phnumber || null,
                    employerName: employerProfile?.fullname || null,
                    state: location?.state || null,
                    city: location?.city || null,
                    recruiterName: Array.isArray(booking.recruiter.Profile)
                        ? booking.recruiter.Profile[0]?.fullname
                        : booking.recruiter.Profile?.fullname || null,
                    recruiterService: booking.Service?.name || null,
                };
            })
            .sort((a, b) =>
                sort === 'asc'
                    ? a.companyName?.localeCompare(b.companyName)
                    : b.companyName?.localeCompare(a.companyName)
            );

        res.status(200).json({
            data: formattedBookings,
            meta: {
                currentPage: parseInt(page),
                perPage: take,
                total: formattedBookings.length,
            },
        });
    } catch (error) {
        console.error('Error fetching employer bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateEmployerBookingStatus = async (req, res) => {
    const { bookingId } = req.params;  // Get bookingId from the URL parameter
    const { status } = req.body;  // Get the new status from the request body

    // Validate the new status to ensure it's one of the allowed values (e.g., 'Pending', 'Confirmed', 'Completed')
    const allowedStatuses = ['Pending', 'Confirmed', 'COMPLETED', 'Cancelled', 'DECLINE'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Update the status of the booking in the database
        const updatedBooking = await prisma.recruiterHiring.update({
            where: {
                id: parseInt(bookingId),  // Ensure the bookingId is parsed as an integer
            },
            data: {
                jobStatus: status,  // Update the job status to the new value
            },
        });

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Return the updated booking information
        res.status(200).json({
            message: 'Booking status updated successfully',
            booking: {
                bookingId: updatedBooking.id,
                status: updatedBooking.jobStatus,
            },
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.getAllRec = async (req, res) => {
    try {
        console.log("Getting all Recruiter list");

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get sorting and search parameters
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Calculate skip and take for pagination
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Prepare where condition for search
        const userWhereCondition = {
            role: "RECRUITER",
            ...(searchQuery && {
                OR: [
                    { email: { contains: searchQuery } },
                    { Profile: { some: { fullname: { contains: searchQuery } } } }
                ]
            })
        };

        // Fetch data from User with optional related Profile and ratings
        const rec = await prisma.user.findMany({
            where: userWhereCondition,
            include: {
                Profile: true,
                Location: true,
                recruiterRecruiterHirings: {
                    include: {
                        TimesheetReview: {
                            select: {
                                rating: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id: sortOrder,
            },
            skip: skip,
            take: take,
        });

        // Fetch total count of recruiters for pagination
        const totalRec = await prisma.user.count({
            where: userWhereCondition,
        });

        // Transform data into the required format
        const formattedRec = rec.map((user) => ({
            userId: user.id,
            name: user.Profile?.[0]?.fullname || null,
            email: user.email,
            phoneNo: user.Profile?.[0]?.phnumber || null,
            address: user.Location.length > 0 ? user.Location[0]?.city : "N/A",
            reviewsList: user.recruiterRecruiterHirings.flatMap(hiring =>
                hiring.TimesheetReview.map(review => review.rating)
            ) || [],
        }));

        // Prepare response with pagination metadata
        const totalPages = Math.ceil(totalRec / pageSize);

        res.status(200).json({
            recruiter: formattedRec,
            pagination: {
                totalItems: totalRec,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                sortOrder: sortOrder,
                searchQuery: searchQuery,
            },
        });
    } catch (error) {
        console.error('Error fetching recruiter data:', error);
        res.status(500).json({ error: 'An error occurred while fetching recruiter data.' });
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
            linkedinProfile: gmentor.companyLink || "Not provided", // Default LinkedIn profile if missing
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
    const { page = 1, limit = 10, sort = 'asc', search = '' } = req.query;  // Extract query params

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    try {
        // Query the database with filters, pagination, and sorting
        const bookings = await prisma.recruiterHiring.findMany({
            where: {
                recruiterId: parseInt(userId),
                id: {
                    equals: search ? parseInt(search) : undefined,  // You can change this to `equals` if you want exact match
                },
            },
            orderBy: {
                id: sort === 'asc' ? 'asc' : 'desc',  // Sorting by bookingId
            },
            take,
            skip,
            select: {
                id: true, // bookingId
                jobStatus: true,
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
                timeSheets: {
                    select: {
                        createdAt: true,
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
                recName: recruiterProfile?.fullname || null,
                email: booking.recruiter?.email || null,
                phnumber: recruiterProfile?.phnumber || null,
                state: locationParts[0]?.trim() || null,
                city: locationParts[1]?.trim() || null,
                timesheetCreatedAt: booking.timeSheets.createdAt || null,
                status: booking.jobStatus,
            };
        });

        // Return the formatted bookings with pagination meta
        res.status(200).json({
            data: formattedBookings,
            meta: {
                currentPage: parseInt(page),
                perPage: take,
                total: formattedBookings.length, // You can calculate the total number of bookings for better pagination
            },
        });
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
    const { model, search } = { ...req.params, ...req.params }; // Extract model and optional search from URL params
    const { page = 1, limit = 10 } = req.query; // Default page 1, limit 10
    console.log(model);
    console.log(search);
    try {
        const skip = (page - 1) * limit;

        // Define search filter dynamically
        const whereClause = search
            ? {
                name: {
                    contains: search, // Partial match search
                },
            }
            : {}; // No filter if search is not provided

        // Fetch total count with or without search filter
        const totalCount = await prisma[model].count({
            where: whereClause,
        });

        // Fetch paginated and filtered data
        const entries = await prisma[model].findMany({
            where: whereClause,
            skip: parseInt(skip),
            take: parseInt(limit),
        });

        // Send response
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



//############################PROFILE APPROVALS

exports.mentorApproval = async (req, res) => {
    const { role } = req.params; // Extract role from params
    const { page = 1, limit = 10, search = '' } = req.query; // Extract pagination and search from query parameters

    console.log(role, page, limit, search);

    try {
        // Validate the role parameter
        const validRoles = ['MENTOR', 'RECRUITER']; // Add all valid roles here
        if (!validRoles.includes(role.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        // Define pagination logic
        const skip = (page - 1) * limit;

        // Query users based on role and search filter on fullname
        const users = await prisma.user.findMany({
            where: {
                role: role.toUpperCase(),
                Profile: {
                    some: { // Use 'some' for hasMany relationship filtering
                        fullname: {
                            contains: search, // Apply search filter

                        },
                    },
                },
            },
            skip: skip,
            take: parseInt(limit), // Limit number of users returned
            select: {
                id: true,
                userStatus: true,
                createdAt: true,
                Profile: {
                    select: {
                        fullname: true,
                        id: true,
                    },
                },
            },
        });

        // Get the total number of users matching the role and search filter
        const totalUsers = await prisma.user.count({
            where: {
                role: role.toUpperCase(),
                Profile: {
                    some: {
                        fullname: {
                            contains: search,

                        },
                    },
                },
            },
        });

        // Format the users array for the response
        const formattedUsers = users.map((user) => ({
            userId: user.id,
            userStatus: user.userStatus || null,
            createdAt: user.createdAt.toISOString().split('T')[0] || null, // Format date
            fullname: user.Profile.length > 0 ? user.Profile[0].fullname : 'No fullname found', // Handle potential array
        }));

        // Return paginated response with total count
        res.status(200).json({
            users: formattedUsers, // Use formatted users
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: parseInt(page),
            },
        });
    } catch (error) {
        console.error(`Error fetching users with role ${role}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





exports.updateUserStatus = async (req, res) => {
    const { userId, userStatus } = req.body;

    try {
        // Validate userStatus value
        const validStatuses = ['APPROVED', 'DISAPPROVED', 'PENDING'];
        if (!validStatuses.includes(userStatus)) {
            return res.status(400).json({ error: 'Invalid userStatus value. Must be APPROVED, DISAPPROVED, or PENDING.' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                email: true,
                userStatus: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the userStatus
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { userStatus },
            select: {
                id: true,
                email: true,
                userStatus: true,
                createdAt: true,

            },
        });

        res.status(200).json({ message: 'User status updated successfully', updatedUser });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRecMenDetailsOLD = async (req, res) => {
    const { userId } = req.params; // Extract userId from params

    try {
        // Fetch user details and related data
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                email: true, // Fetch only the email field from the User model
                Profile: {
                    select: {
                        fullname: true,
                        phnumber: true,
                        avatarId: true,
                        mentorvideolink: true,
                        language: true,
                        tagline: true,
                        industry: true,
                        resumeLink: true,
                        linkedinLink: true,
                        about: true,
                    },
                },
                Location: {
                    select: {
                        city: true,
                        state: true,
                    },
                },
                services: true,
            },
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format the response
        const formattedUser = {
            userId: user.id,
            email: user.email,
            fullName: user.Profile[0]?.fullname || null,
            phoneNumber: user.Profile[0]?.phnumber || null,
            avatarId: generateAvatarUrl(user.Profile[0]?.avatarId) || null,
            mentorVideoLink: generateVideoUrl(user.Profile[0]?.mentorevideolink) || null,
            language: user.Profile[0]?.language || null,
            tagline: user.Profile[0]?.tagline || null,
            industry: user.Profile[0]?.industry || null,
            resumeLink: generateResumeUrl(user.Profile[0]?.resumeLink) || null,
            linkedinLink: user.Profile[0]?.linkedinLink || null,
            about: user.Profile[0]?.about || null,

            city: user.Location[0]?.city || null,
            state: user.Location[0]?.state || null,

            services: user.services || [],
        };

        // Send formatted response
        res.status(200).json(formattedUser);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getRecMenDetails = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch user details along with Timesheet and Reviews
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                email: true, // Fetch only the email field from the User model
                Profile: {
                    select: {
                        fullname: true,
                        phnumber: true,
                        avatarId: true,
                        mentorvideolink: true,
                        language: true,
                        tagline: true,
                        industry: true,
                        resumeLink: true,
                        linkedinLink: true,
                        about: true,
                    },
                },
                Location: {
                    select: {
                        city: true,
                        state: true,
                    },
                },
                services: true,
                recruiterRecruiterHirings: {  // Fetch recruiter's hiring records
                    select: {
                        id: true,
                        jobStatus: true,
                        paymentStatus: true,
                        invoice: true,
                        paidOn: true,
                        adminApprovalStatus: true,
                        recruiterApprovalStatus: true,
                        timeSheets:true,
                        TimesheetReview: {
                            select: {
                                id: true,
                                content: true,
                                rating: true,
                                createdAt: true,
                            }
                        }
                    }
                }
            }
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format response
        const formattedUser = {
            userId: user.id,
            email: user.email,
            fullName: user.Profile?.fullname || null,
            phoneNumber: user.Profile?.phnumber || null,
            avatarId: user.Profile?.avatarId ? generateAvatarUrl(user.Profile.avatarId) : null,
            mentorVideoLink: user.Profile?.mentorvideolink ? generateVideoUrl(user.Profile.mentorvideolink) : null,
            language: user.Profile?.language || null,
            tagline: user.Profile?.tagline || null,
            industry: user.Profile?.industry || null,
            resumeLink: user.Profile?.resumeLink ? generateResumeUrl(user.Profile.resumeLink) : null,
            linkedinLink: user.Profile?.linkedinLink || null,
            about: user.Profile?.about || null,
            city: user.Location?.city || null,
            state: user.Location?.state || null,
            services: user.services || [],

            // Recruiter Hiring Details
            recruiterHirings: user.recruiterRecruiterHirings.map(hiring => ({
                hiringId: hiring.id,
                jobStatus: hiring.jobStatus,
                paymentStatus: hiring.paymentStatus,
                invoice: hiring.invoice,
                paidOn: hiring.paidOn,
                adminApprovalStatus: hiring.adminApprovalStatus,
                recruiterApprovalStatus: hiring.recruiterApprovalStatus,

                // Timesheet Details
                timeSheets: hiring.timeSheets.map(ts => ({
                    timesheetId: ts.id,
                    hoursWorked: ts.hoursWorked,
                    workDescription: ts.workDescription,
                    createdAt: ts.createdAt,
                })),

                // Reviews on Timesheets
                timesheetReviews: hiring.TimesheetReview.map(review => ({
                    reviewId: review.id,
                    content: review.content,
                    rating: review.rating,
                    createdAt: review.createdAt,
                })),
            })),
        };

        // Send response
        res.status(200).json({
            success: true,
            message: "User details fetched successfully.",
            data: formattedUser
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getRecruiterHiring = async (req, res) => {
    const { page = 1, limit = 10, sort = 'asc', search = '' } = req.query; // Extract query params

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    try {
        // Count total records for pagination
        const totalRecords = await prisma.recruiterHiring.count({
            where: {
                id: search ? parseInt(search) : undefined,
            },
        });

        // Query the database with filters, pagination, and sorting
        const bookings = await prisma.recruiterHiring.findMany({
            where: {
                id: search ? parseInt(search) : undefined,
            },
            orderBy: {
                id: sort === 'asc' ? 'asc' : 'desc', // Sorting by id
            },
            take,
            skip,
            select: {
                id: true,
                adminApprovalStatus: true,
                invoice: true,
                paymentStatus: true,
                createdAt: true,
                recruiter: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true,
                            },
                        },
                    },
                },
                employer: {
                    select: {
                        Profile: {
                            select: {
                                companyName: true,
                            },
                        },
                    },
                },
            },
        });

        // Format the response
        const formattedBookings = bookings.map((booking) => {
            const recruiterProfile = booking.recruiter?.Profile?.[0];
            const employerProfile = booking.employer?.Profile?.[0];

            return {
                bookingId: booking.id,
                recruiterName: recruiterProfile?.fullname || null,
                employerCompanyName: employerProfile?.companyName || null,
                appliedOn: booking.createdAt?.toISOString() || null,
                adminStatus: booking.adminApprovalStatus || null,
                invoice: booking.invoice || null,
                paymentStatus: booking.paymentStatus || null,
            };
        });

        // Return the formatted bookings with pagination meta
        res.status(200).json({
            data: formattedBookings,
            meta: {
                currentPage: parseInt(page),
                perPage: take,
                totalRecords,
                totalPages: Math.ceil(totalRecords / take),
            },
        });
    } catch (error) {
        console.error("Error in getRecruiterHiring:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRecruiterHiringDetail = async (req, res) => {
    const { bookingId } = req.params; // Extract booking ID from request parameters

    try {
        // Query the database for the specific RecruiterHiring record
        const booking = await prisma.recruiterHiring.findUnique({
            where: {
                id: parseInt(bookingId),
            },
            select: {
                id: true,
                adminApprovalStatus: true,
                invoice: true,
                paymentStatus: true,
                createdAt: true,
                recruiter: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true,
                            },
                        },
                    },
                },
                employer: {
                    select: {
                        Profile: {
                            select: {
                                companyName: true,
                            },
                        },
                    },
                },
                Service: {
                    select: {
                        IndustryName: true,
                        name: true,
                        pricing: true,
                    },
                },
            },
        });

        // Check if booking exists
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        // Format the response
        const recruiterProfile = booking.recruiter?.Profile?.[0];
        const employerProfile = booking.employer?.Profile?.[0];
        const serviceDetails = booking.Service;

        const response = {
            bookingId: booking.id,
            recruiterName: recruiterProfile?.fullname || null,
            employerCompanyName: employerProfile?.companyName || null,
            appliedOn: booking.createdAt?.toISOString() || null,
            adminStatus: booking.adminApprovalStatus || null,
            invoice: booking.invoice || null,
            paymentStatus: booking.paymentStatus || null,
            serviceDetails: serviceDetails
                ? {
                    industryName: serviceDetails.IndustryName,
                    name: serviceDetails.name,
                    price: serviceDetails.pricing,
                }
                : null,
        };

        // Return the formatted response
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getRecruiterHiringDetail:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.updateInvoice = async (req, res) => {
    const { id } = req.params; // Extract the recruiterHiring ID from the request parameters
    const { invoice } = req.body; // Extract the invoice value from the request body

    try {
        // Validate input
        if (!id || !invoice) {
            return res.status(400).json({ error: 'RecruiterHiring ID and invoice are required.' });
        }

        // Update the invoice in the database
        const updatedRecruiterHiring = await prisma.recruiterHiring.update({
            where: { id: parseInt(id) },
            data: { invoice },
        });

        // Respond with the updated record
        res.status(200).json({
            message: 'Invoice updated successfully.',
            data: updatedRecruiterHiring,
        });
    } catch (error) {
        console.error('Error in updateInvoice:', error.message);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'RecruiterHiring record not found.' });
        }

        res.status(500).json({ error: 'Internal server error.' });
    }
};



exports.getPaymentDetailrole = async (req, res) => {
    const { role } = req.params;
    console.log("Role:", role);

    try {
        let formatedData = []; // Declare formatted data
        let result = []; // Declare result

        if (role === 'EMPLOYER') {
            console.log("Inside EMPLOYER");

            result = await prisma.recruiterHiring.findMany({
                select: {
                    transactionNumber: true,
                    paidOn: true,
                    paymentStatus: true,
                    employer: {
                        select: {
                            Profile: {
                                select: {
                                    fullname: true,
                                },
                            },
                        },
                    },
                    Service: {
                        select: {
                            name: true,
                            pricing: true,
                        },
                    },
                },
            });

            formatedData = result.map((hiring) => ({
                transactionId: hiring.transactionNumber,
                fullname: hiring.employer?.Profile[0]?.fullname || null,
                paidOn: hiring.paidOn,
                serviceName: hiring.Service?.name || null,
                servicePrice: hiring.Service?.pricing || null,
                paymentStatus: hiring.paymentStatus,
            }));
        } else if (role === 'JOB_SEEKER') {
            console.log("Inside JOB_SEEKER");

            result = await prisma.mentorSessionManagement.findMany({
                select: {
                    transactionNumber: true,
                    paidOn: true,
                    paymentStatus: true,
                    user: {
                        select: {
                            Profile: {
                                select: {
                                    fullname: true,
                                },
                            },
                        },
                    },
                    Service: {
                        select: {
                            name: true,
                            pricing: true,
                        },
                    },
                },
            });

            formatedData = result.map((session) => ({
                transactionId: session.transactionNumber,
                fullname: session.user?.Profile[0]?.fullname || null,
                paidOn: session.paidOn,
                serviceName: session.Service?.name || null,
                servicePrice: session.Service?.pricing || null,
                paymentStatus: session.paymentStatus,
            }));
        } else {
            return res.status(400).json({ error: "Invalid role provided" });
        }

        res.status(200).json({
            role,
            data: formatedData,
        });
    } catch (error) {
        console.error("Error in fetching data:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getPaymentDetails = async (req, res) => {
    try {
        // Fetch data from recruiterHiring table
        const employerData = await prisma.recruiterHiring.findMany({
            select: {
                transactionNumber: true,
                paidOn: true,
                paymentStatus: true,
                createdAt: true,
                employer: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true,
                            },
                        },
                    },
                },
                Service: {
                    select: {
                        name: true,
                        pricing: true,
                    },
                },
            },
        });

        // Format employer data
        const formattedEmployerData = employerData.map((hiring) => ({
            transactionId: hiring.transactionNumber,
            fullname: hiring.employer?.Profile[0]?.fullname || null,
            paidOn: hiring.paidOn,
            serviceName: hiring.Service?.name || null,
            servicePrice: hiring.Service?.pricing || null,
            paymentStatus: hiring.paymentStatus,
            createdAt: hiring.createdAt,
            source: 'EMPLOYER',
        }));

        console.log(formattedEmployerData);
        // Fetch data from mentorSessionManagement table
        const jobSeekerData = await prisma.mentorSessionManagement.findMany({
            select: {
                transactionNumber: true,
                paidOn: true,
                paymentStatus: true,
                createdAt: true,
                user: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true,
                            },
                        },
                    },
                },
                Service: {
                    select: {
                        name: true,
                        pricing: true,
                    },
                },
            },
        });

        // Format job seeker data
        const formattedJobSeekerData = jobSeekerData.map((session) => ({
            transactionId: session.transactionNumber,
            fullname: session.user?.Profile[0]?.fullname || null,
            paidOn: session.paidOn,
            serviceName: session.Service?.name || null,
            servicePrice: session.Service?.pricing || null,
            paymentStatus: session.paymentStatus,
            createdAt: session.createdAt,
            source: 'JOB_SEEKER',
        }));

        // Combine and sort data based on createdAt
        const combinedData = [...formattedEmployerData, ...formattedJobSeekerData].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Return response
        res.status(200).json({
            data: combinedData,
        });
    } catch (error) {
        console.error("Error in fetching data:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getEmployerPlainDetial = async (req, res) => {
    try {
        const employerId = parseInt(req.params.id, 10);

        if (isNaN(employerId)) {
            return res.status(400).json({ success: false, message: "Invalid employer ID." });
        }

        // Fetch subscriptions bought by the employer
        const subscriptionsBought = await prisma.subscriptionBought.findMany({
            where: { userId: employerId },
            select: {
                id: true,
                subscription: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        description: true,
                    },
                },
                price: true,
                jobSlots: true,
                resumeSearches: true,
                broughtAt: true,
            },
        });

        if (!subscriptionsBought || subscriptionsBought.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No subscriptions found for this employer.",
                data: [],
            });
        }

        // Format the response
        const formattedSubscriptions = subscriptionsBought.map((subscription) => ({
            subscriptionBoughtId: subscription.id,
            subscriptionId: subscription.subscription.id,
            name: subscription.subscription.name,
            description: subscription.subscription.description,
            pricePaid: subscription.price,
            jobSlots: subscription.jobSlots,
            resumeSearches: subscription.resumeSearches,
            purchasedAt: subscription.broughtAt,
        }));

        // Respond with data
        return res.status(200).json({
            success: true,
            message: "Data fetched successfully.",
            data: {
                subscriptionsBought: formattedSubscriptions,
            },
        });

    } catch (error) {
        console.error("Error fetching employer subscriptions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};








exports.upsertAdminSettings = async (req, res) => {
    const {
        recruiterDes,
        commission,
        postTitle,
        postDes,
        commissionDes,
        aboutUs,
        termsAndConditions,
        privacyPolicy,
    } = req.body;

    try {
        // Build update and create objects dynamically
        const updateData = {};
        const createData = {};

        if (recruiterDes !== undefined) {
            updateData.recruiterDes = recruiterDes;
            createData.recruiterDes = recruiterDes;
        }
        if (commission !== undefined) {
            updateData.commission = commission;
            createData.commission = commission;
        }
        if (postTitle !== undefined) {
            updateData.postTitle = postTitle;
            createData.postTitle = postTitle;
        }
        if (postDes !== undefined) {
            updateData.postDes = postDes;
            createData.postDes = postDes;
        }
        if (commissionDes !== undefined) {
            updateData.commissionDes = commissionDes;
            createData.commissionDes = commissionDes;
        }
        if (aboutUs !== undefined) {
            updateData.aboutUs = aboutUs;
            createData.aboutUs = aboutUs;
        }
        if (termsAndConditions !== undefined) {
            updateData.termsAndConditions = termsAndConditions;
            createData.termsAndConditions = termsAndConditions;
        }
        if (privacyPolicy !== undefined) {
            updateData.privacyPolicy = privacyPolicy;
            createData.privacyPolicy = privacyPolicy;
        }

        // Always update the updatedAt field
        updateData.updatedAt = new Date();

        // Upsert the AdminSettings record
        const adminSettings = await prisma.adminSettings.upsert({
            where: { id: 1 }, // Ensure only one record exists
            update: updateData,
            create: createData,
        });

        res.status(200).json({
            message: 'Admin settings updated successfully',
            adminSettings,
        });
    } catch (error) {
        console.error('Error updating admin settings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAdminSettings = async (req, res) => {
    try {
        // Fetch the AdminSettings record
        const adminSettings = await prisma.adminSettings.findUnique({
            where: { id: 1 }, // Ensure only one record exists
        });

        // Check if the AdminSettings exists
        if (!adminSettings) {
            return res.status(404).json({
                success: false,
                message: 'Admin settings not found.',
            });
        }

        // Respond with the fetched admin settings
        return res.status(200).json({
            success: true,
            message: 'Admin settings fetched successfully.',
            data: adminSettings,
        });
    } catch (error) {
        console.error('Error fetching admin settings:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};


exports.postPages = async (req, res) => {
    const { name } = req.body;
    try {
        const page = await prisma.page.create({
            data: { name },
        });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create page' });
    }
};

exports.postSection = async (req, res) => {
    const { title, pageId } = req.body;
    try {
        const section = await prisma.section.create({
            data: { title, pageId },
        });
        res.json(section);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create section' });
    }
};


exports.postContents = async (req, res) => {
    const { heading, description, sectionId } = req.body;
    try {
        const content = await prisma.content.create({
            data: { heading, description, sectionId },
        });
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create content' });
    }
};

exports.getPages = async (req, res) => {

    try {
        const pages = await prisma.page.findMany({
            include: {
                sections: {
                    include: {
                        contents: true,
                    },
                },
            },
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
};


exports.getProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                Profile: {
                    select: {
                        avatarId: true, // Include avatarId field
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }



        // Extract and format fields
        const avatarUrl = generateAvatarUrl(user.Profile[0].avatarId);

        // Remove unnecessary fields and format response
        const {
            password, // Exclude password
            Profile,  // Exclude Profile object
            email_confirm, // Transform to camelCase
            ...restUser
        } = user;

        const formattedResponse = {
            ...restUser,
            emailConfirm: user.email_confirm,
            avatarUrl, // Add flattened avatarUrl
        };

        res.json(formattedResponse);
    } catch (error) {
        res
            .status(500)
            .json({ error: `An error occurred while fetching user details: ${error.message}` });
    }
};





exports.manageUser = async (req, res) => {
    const { id } = req.params;
    const { action, email, secondaryEmail, isActive, deActivate, role, newPassword } = req.body;

    try {
        let result;

        switch (action) {
            case "updateProfile":
                result = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: {
                        email,
                        secondaryEmail,
                        isActive,
                        deActivate,
                        role,
                    },
                });
                delete result.password;
                res.json({ message: "User profile updated successfully", user: result });
                break;

            case "changePassword":
                if (!newPassword) {
                    return res.status(400).json({ error: "New password is required" });
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                result = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: { password: hashedPassword },
                });
                delete result.password;
                res.json({ message: "Password updated successfully", user: result });
                break;

            case "deactivateAccount":
                result = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: { deActivate: true, isActive: false },
                });
                delete result.password;
                res.json({ message: "User deactivated successfully", user: result });
                break;

            case "delete":
                await prisma.user.delete({
                    where: { id: parseInt(id) },
                });
                delete result.password;
                res.json({ message: "User deleted successfully" });
                break;

            default:
                res.status(400).json({ error: "Invalid action specified" });
                break;
        }
    } catch (error) {
        res.status(500).json({ error: `An error occurred: ${error.message}` });
    }
};


exports.getBlog = async (req, res) => {
    try {
        // Fetch blogs with the required fields and associated mentor information
        const blogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                createdAt: true,
                status: true,
                user: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true, // Ensure this matches your schema
                            },
                        },
                    },
                },
            },
        });

        // console.log(blogs);

        // Transform data to match the expected response format
        const blogData = blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            postedBy: blog.user?.Profile[0].fullname || 'Unknown', // Handle null values
            createdAt: blog.createdAt,
            status: blog.status,
        }));

        res.status(200).json({ success: true, data: blogData });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


exports.updateBlogStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id);
    console.log(status);

    try {
        // Validate the input
        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID and status are required.',
            });
        }

        // Validate the status value
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values are: ${validStatuses.join(', ')}.`,
            });
        }

        // Update the blog status
        const updatedBlog = await prisma.blog.update({
            where: { id: Number(id) },
            data: { status },
        });

        // Respond with success
        res.status(200).json({
            success: true,
            message: 'Blog status updated successfully.',
            data: updatedBlog,
        });
    } catch (error) {
        console.error('Error updating blog status:', error);

        // Handle specific error cases
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Blog not found.',
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate input
        if (!id) {
            return res.status(400).json({ message: "Blog ID is required." });
        }

        // Fetch the blog
        const blog = await prisma.blog.findUnique({
            where: { id: parseInt(id) },
        });

        // Check if blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Respond with the blog data
        return res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        return res.status(500).json({ message: "Internal server error.", error });
    }
};


// Update blog title and content
exports.updateBlogContent = async (req, res) => {
    try {
        const { id } = req.params; // Blog ID from request parameters
        const { title, content } = req.body; // Data from request body

        // Validate input
        if (!id || (!title && !content)) {
            return res.status(400).json({ message: "Invalid input. Provide blog ID and at least one field (title or content) to update." });
        }

        // Fetch the blog to ensure it exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Update the blog with only title and content
        const updatedBlog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                ...(title && { title }), // Update title if provided
                ...(content && { content }), // Update content if provided
            },
        });

        // Respond with the updated blog
        return res.status(200).json({ message: "Blog updated successfully.", data: updatedBlog });
    } catch (error) {
        console.error("Error updating blog:", error);
        return res.status(500).json({ message: "Internal server error.", error });
    }
};



exports.getCountsTimesheet = async (req, res) => {
    try {
        // Fetch the required counts
        const [pendingPaymentsCount, pendingAdminApprovalCount, totalRecruitersCount, totalEmployersCount] = await Promise.all([
            // Count of "PENDING" payment status
            prisma.recruiterHiring.count({
                where: {
                    paymentStatus: "PENDING",
                },
            }),
            // Count of 'adminApprovalStatus' as "PENDING"
            prisma.recruiterHiring.count({
                where: {
                    adminApprovalStatus: "PENDING",
                },
            }),
            // Count of distinct recruiters using findMany and Set
            prisma.recruiterHiring.findMany({
                where: {
                    recruiterId: {
                    },
                },
                select: {
                    recruiterId: true,
                },
            }).then((result) => new Set(result.map((r) => r.recruiterId)).size),
            // Count of distinct employers using findMany and Set
            prisma.recruiterHiring.findMany({
                where: {
                    employerId: {
                    },
                },
                select: {
                    employerId: true,
                },
            }).then((result) => new Set(result.map((e) => e.employerId)).size),
        ]);

        // If all counts are zero, return an empty list
        if (
            pendingPaymentsCount === 0 &&
            pendingAdminApprovalCount === 0 &&
            totalRecruitersCount === 0 &&
            totalEmployersCount === 0
        ) {
            return res.status(200).json({
                success: true,
                counts: [],
            });
        }

        // Send the counts
        res.status(200).json({
            success: true,
            counts: {
                pendingPaymentsCount,
                pendingAdminApprovalCount,
                totalRecruitersCount,
                totalEmployersCount,
            },
        });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the counts.",
            error: error.message,
        });
    }
};



exports.getTimesheetDetails = async (req, res) => {
    try {
        // Extract query parameters from the request
        const { companyName, startDate, endDate, page = 1, pageSize = 10 } = req.query;
        console.log(companyName);

        // Construct the 'where' clause dynamically based on provided filters
        const whereClause = {};

        // Add company name filter if provided
        if (companyName) {
            whereClause.recruiterHiring = {
                employer: {
                    Profile: {
                        some: {  // Use 'some' to match any profile that contains the company name
                            companyName: {
                                contains: companyName,
                            }
                        }
                    }
                }
            };
        }

        // Add date filters if provided
        if (startDate || endDate) {
            whereClause.createdAt = {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) })
            };
        }

        // Query the timesheets with dynamic filtering, pagination, and sorting
        const timesheets = await prisma.timeSheet.findMany({
            where: whereClause,
            select: {
                id: true,
                recruiterHiring: {
                    select: {
                        id: true,
                        recruiter: {
                            select: {
                                Profile: {
                                    select: {
                                        fullname: true,
                                    },
                                },
                            },
                        },
                        employer: {
                            select: {
                                Profile: {
                                    select: {
                                        companyName: true,
                                    },
                                },
                            },
                        },
                        adminApprovalStatus: true,
                        paymentStatus: true,
                    },
                },
                createdAt: true,
                totalAmountDue: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Map the results to the desired format
        const formattedTimesheets = timesheets.map((ts) => ({
            timesheetNo: ts.id,
            bookingID: ts.recruiterHiring?.id || null,
            recruiterName: ts.recruiterHiring?.recruiter?.Profile[0]?.fullname || null,
            employerCompanyName: ts.recruiterHiring?.employer?.Profile[0]?.companyName || null,
            createdAt: ts.createdAt,
            totalAmountDue: ts.totalAmountDue,
            recruiterAmount: 300,
            paymentStatus: ts.recruiterHiring?.paymentStatus || null,
            adminApprovalStatus: ts.recruiterHiring?.adminApprovalStatus || null,
        }));

        // Return the response with pagination details
        res.status(200).json({
            success: true,
            timesheets: formattedTimesheets,
            page,
            pageSize,
            totalTimesheets: await prisma.timeSheet.count({ where: whereClause }),
        });
    } catch (error) {
        console.error("Error fetching timesheet details:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the timesheet details.",
            error: error.message,
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    const { timesheetId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED", "PAID", "DECLINE"].includes(paymentStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment status.',
        });
    }

    try {
        const updatedTimesheet = await prisma.timeSheet.update({
            where: { id: parseInt(timesheetId) },
            data: {
                recruiterHiring: {
                    update: {
                        paymentStatus,  // Update paymentStatus in the related recruiterHiring model
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully.',
            updatedTimesheet,
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the payment status.',
            error: error.message,
        });
    }
};


exports.updateAdminApprovalStatus = async (req, res) => {
    const { timesheetId } = req.params;
    const { adminApprovalStatus } = req.body;

    if (!adminApprovalStatus || !["ACCEPTED", "APPROVED", "DECLINED", "DECLINE", "CANCELLED", "PENDING"].includes(adminApprovalStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid admin approval status.',
        });
    }

    try {
        const updatedTimesheet = await prisma.timeSheet.update({
            where: { id: parseInt(timesheetId) },
            data: {
                recruiterHiring: {
                    update: {
                        adminApprovalStatus,  // Update adminApprovalStatus in the related recruiterHiring model
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Admin approval status updated successfully.',
            updatedTimesheet,
        });
    } catch (error) {
        console.error("Error updating admin approval status:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the admin approval status.',
            error: error.message,
        });
    }
};


exports.addInvoice = async (req, res) => {
    const { timesheetId } = req.params;
    const { invoice } = req.body;

    if (!invoice || typeof invoice !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invoice must be a valid string.',
        });
    }

    try {
        const updatedTimesheet = await prisma.timeSheet.update({
            where: { id: parseInt(timesheetId) },
            data: {
                recruiterHiring: {
                    update: {
                        invoice, // Update the invoice field in the related recruiterHiring model
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Invoice added successfully.',
            updatedTimesheet,
        });
    } catch (error) {
        console.error("Error adding invoice:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while adding the invoice.',
            error: error.message,
        });
    }
};



exports.getNotification = async (req, res) => {
    try {
        // Fetch notifications in descending order of createdAt
        const notifications = await prisma.adminNotification.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                // user: true,        // Include sender details
                //  timesheet: true,   // Include timesheet details
            },
        });

        if (!notifications || notifications.length === 0) {
            // Return empty array if no records found
            return res.status(200).json([]);
        }

        // Process notifications to exclude senderId and null/undefined fields
        const filteredNotifications = notifications.map((notification) => {
            const parsedNotification = {
                ...notification,
                actionButtons: notification.actionButtons ? JSON.parse(notification.actionButtons) : null,
            };

            // Remove fields with null or undefined values, and skip senderId
            return Object.fromEntries(
                Object.entries(parsedNotification).filter(
                    ([key, value]) => key !== 'senderId' && value != null
                )
            );
        });

        res.status(200).json(filteredNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};



exports.getTimesheetById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Timesheet ID is required" });
    }

    try {
        // Fetch the timesheet based on the provided ID
        const timesheet = await prisma.timeSheet.findUnique({
            where: {
                id: parseInt(id, 10),
            },
            include: {
                //   recruiterHiring: true,        // Include related recruiterHiring details
                //   AdminNotification: true,     // Include related AdminNotification details
            },
        });

        if (!timesheet) {
            // Return 404 if the timesheet does not exist
            return res.status(404).json({ message: "Timesheet not found" });
        }

        // Filter null/undefined fields from the timesheet object
        const filteredTimesheet = Object.fromEntries(
            Object.entries(timesheet).filter(([_, value]) => value != null)
        );

        res.status(200).json(filteredTimesheet);
    } catch (error) {
        console.error('Error fetching timesheet:', error);
        res.status(500).json({ error: 'Failed to fetch timesheet' });
    }
};

exports.getJobSeekerById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        const jobSeeker = await prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { role: 'JOB_SEEKER' } // Ensuring we fetch only job seekers
                ]
            },
            select: {
                id: true,
                Profile: {
                    select: {
                        avatarId: true,
                        fullname: true,
                        tagline: true,
                        location: true,
                        about: true,
                        language: true,
                        mentorvideolink: true,
                    }
                },
                services: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        pricing: true
                    }
                },
                Certificate: true,
                Education: true,
                Location: true,
                Documents: {
                    select: {
                        resumeLink: true,
                        portfolioLink: true,
                        websiteLink: true,
                        additionalLink: true,
                    }
                }
            }
        });

        if (!jobSeeker) {
            return res.status(404).json({ success: false, message: "Job Seeker not found." });
        }

        // Process profile details (if available)
        if (jobSeeker.Profile) {
            if (jobSeeker.Profile.avatarId) {
                jobSeeker.Profile.avatarId = generateAvatarUrl(jobSeeker.Profile.avatarId);
            }
            if (jobSeeker.Profile.mentorvideolink) {
                jobSeeker.Profile.mentorvideolink = generateVideoUrl(jobSeeker.Profile.mentorvideolink);
            }
        }

        // Generate resume link if available
        if (jobSeeker.Documents) {
            if (jobSeeker.Documents.resumeLink) {
                jobSeeker.Documents.resumeLink = generateResumeUrl(jobSeeker.Documents.resumeLink);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Job Seeker data fetched successfully.",
            data: jobSeeker
        });

    } catch (error) {
        console.error("Error fetching job seeker:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
















