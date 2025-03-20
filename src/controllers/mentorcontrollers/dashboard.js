const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");
const bcrypt = require('bcryptjs');


exports.getMentorStats = async (req, res) => {
    try {
        const { mentorId } = req.params;

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required.",
            });
        }

        const mentorIdInt = parseInt(mentorId, 10);

        // Fetch total sessions booked for the mentor
        const totalSessions = await prisma.mentorSessionManagement.count({
            where: { mentorProfileId: mentorIdInt },
        });

        // Fetch total earnings for the mentor
        const totalEarnings = await prisma.mentorSessionManagement.aggregate({
            _sum: {
                selectedService: true, // Assuming selectedService or another numeric field holds earnings
            },
            where: {
                mentorProfileId: mentorIdInt,
                paymentStatus: "COMPLETED",
            },
        });

        // Fetch total reviews received for the mentor
        const totalReviews = await prisma.review.count({
            where: {
                mentorSessionManagement: {
                    mentorProfileId: mentorIdInt,
                },
            },
        });

        // Prepare the response
        return res.status(200).json({
            success: true,
            message: "Mentor statistics fetched successfully.",
            data: {
                totalSessions,
                totalEarnings: totalEarnings._sum.selectedService || 0,
                totalReviews,
            },
        });
    } catch (error) {
        console.error("Error fetching mentor statistics:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};


exports.getUpcomingSessions = async (req, res) => {
    try {
        const { mentorId } = req.params;

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required.",
            });
        }

        const mentorIdInt = parseInt(mentorId, 10); // Ensure mentorId is an integer

        if (isNaN(mentorIdInt)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Mentor ID.",
            });
        }

        // Fetch upcoming sessions with the selected data (avatarId, fullname, email)
        const todaySessions = await prisma.mentorSessionManagement.findMany({
            where: {
                mentorProfileId: mentorIdInt, // Use the integer mentorId
                status: "ACCEPTED",
                selectedDateTime: {
                    gte: new Date(), // Only fetch sessions with a `selectedDateTime` greater than or equal to the current date and time
                },
            },
            select: {
                id: true,
                status: true,
                selectedDateTime: true,
                user: {
                    select: {
                        email: true, // Get user's email
                        Profile: {
                            select: {
                                avatarId: true, // Get avatarId from the Profile model
                                fullname: true, // Get fullname from the Profile model
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
            orderBy: {
                selectedDateTime: "asc",
            },
        });

        // Flatten the response into a non-nested structure
        const formattedSessions = todaySessions.map(session => ({
            sessionId: session.id,
            status: session.status,
            selectedDateTime: session.selectedDateTime,
            userEmail: session.user.email, // Flattened email
            fullname: session.user.Profile[0].fullname,
            profile: generateAvatarUrl(session.user.Profile[0].avatarId),
            serviceName: session.Service.name, // Flattened service name
            servicePricing: session.Service.pricing, // Flattened service pricing
        }));

        return res.status(200).json({
            success: true,
            message: "Upcoming sessions fetched successfully.",
            data: {
                todaySessions: formattedSessions,
            },
        });
    } catch (error) {
        console.error("Error fetching upcoming sessions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

exports.getMentorReviews = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { page = 1, limit = 1 } = req.query; // Default to page 1 and limit 10 reviews

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required.",
            });
        }

        const mentorIdInt = parseInt(mentorId, 10); // Ensure mentorId is an integer

        if (isNaN(mentorIdInt)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Mentor ID.",
            });
        }

        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch reviews for the mentor's sessions with pagination
        const reviews = await prisma.mentorSessionManagement.findMany({
            where: {
                mentorProfileId: mentorIdInt,
                status: "ACCEPTED", // Ensure the session is accepted
            },
            select: {
                reviews: { // Fetch the reviews associated with the sessions
                    select: {
                        id: true,  // Review ID
                        rating: true,  // Rating given
                        content: true,  // Review content
                        createdAt: true,  // When the review was created
                    }
                },
                user: {
                    select: {
                        email: true,  // User's email
                        Profile: { // Fetch user's profile (fullname and avatarId)
                            select: {
                                fullname: true,
                                avatarId: true,
                            }
                        }
                    }
                }
            },
            skip: skip,  // Skip records for pagination
            take: limit, // Limit the number of records per page
        });

        // Flatten the reviews into a non-nested structure
        const formattedReviews = reviews.flatMap(session =>
            session.reviews.map(review => ({
                rating: review.rating,
                content: review.content,  // Review content
                createdAt: review.createdAt,
                jsname: session.user.Profile[0].fullname, // Reviewer's full name
                profile: generateAvatarUrl(session.user.Profile[0].avatarId), // Reviewer's avatar ID
            }))
        );

        // Get the total count of reviews for pagination (for the total number of pages)
        const totalReviewsCount = await prisma.mentorSessionManagement.count({
            where: {
                mentorProfileId: mentorIdInt,
                status: "ACCEPTED",
            }
        });

        const totalPages = Math.ceil(totalReviewsCount / limit); // Calculate total pages

        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully.",
            data: {
                reviews: formattedReviews,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalReviews: totalReviewsCount,
                }
            },
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

exports.getMentorEarnings = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { year } = req.query; // Optional query parameter for filtering by year

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required.",
            });
        }

        const mentorIdInt = parseInt(mentorId, 10); // Ensure mentorId is an integer

        if (isNaN(mentorIdInt)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Mentor ID.",
            });
        }

        // Fetch earnings data
        const earnings = await prisma.mentorSessionManagement.findMany({
            where: {
                mentorProfileId: mentorIdInt,
                paymentStatus: "COMPLETED", // Include only completed payments
            },
            select: {
                selectedDateTime: true, // For grouping
                Service: {
                    select: {
                        pricing: true, // Fetch the pricing of the service
                    },
                },
            },
            orderBy: {
                selectedDateTime: "asc",
            },
        });

        // Calculate total, monthly, and yearly earnings
        let totalEarnings = 0;
        const monthlyEarnings = {};
        const yearlyEarnings = {};

        earnings.forEach((session) => {
            const pricing = session.Service?.pricing || 0; // Default to 0 if no service pricing
            totalEarnings += pricing;

            const sessionDate = new Date(session.selectedDateTime);
            const month = sessionDate.toLocaleString("default", { month: "long" });
            const yearKey = sessionDate.getFullYear();

            // Group earnings by month and year
            monthlyEarnings[`${yearKey}-${month}`] = (monthlyEarnings[`${yearKey}-${month}`] || 0) + pricing;
            yearlyEarnings[yearKey] = (yearlyEarnings[yearKey] || 0) + pricing;
        });

        // If a year is provided, filter the results by the specified year
        let filteredYearlyEarnings = yearlyEarnings;
        let filteredMonthlyEarnings = monthlyEarnings;
        if (year) {
            const yearInt = parseInt(year, 10);
            if (!isNaN(yearInt)) {
                filteredYearlyEarnings = { [yearInt]: yearlyEarnings[yearInt] || 0 };
                filteredMonthlyEarnings = Object.fromEntries(
                    Object.entries(monthlyEarnings).filter(([key]) => key.startsWith(`${yearInt}-`))
                );
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year format.",
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Earnings fetched successfully.",
            data: {
                totalEarnings: totalEarnings.toFixed(2),
                monthlyEarnings: filteredMonthlyEarnings,
                yearlyEarnings: filteredYearlyEarnings,
            },
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};



exports.linkCalendly = async (req, res) => {
    try {
        const { userId } = req.id;
        const {  calendlyLink } = req.body;

        if (!userId || !calendlyLink) {
            return res.status(400).json({ message: "userId and calendlyLink are required" });
        }

        // Update profile with new Calendly link
        const updatedProfile = await prisma.profile.update({
            where: { userId: parseInt(userId) },
            data: { calendlyLink },
        });

        return res.status(200).json({ message: "Calendly link updated successfully", profile: updatedProfile });
    } catch (error) {
    console.error("Error updating Calendly link:", error);
    return res.status(500).json({ message: "Internal server error" });
    }
};














