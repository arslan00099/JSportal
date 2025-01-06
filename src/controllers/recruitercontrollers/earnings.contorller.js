const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");

// exports.getEarnings = async (req, res) => {
//     try {
//         const { recruiterId, filter, startDate, endDate } = req.query; // Accept additional query params

//         // Parse recruiterId and filter dates if provided
//         const parsedRecruiterId = Number(recruiterId);
//         const start = startDate ? new Date(startDate) : null;
//         const end = endDate ? new Date(endDate) : null;

//         // Date range filter
//         let dateFilter = {};
//         const today = new Date();

//         switch (filter) {
//             case 'weekly':
//                 dateFilter = {
//                     createdAt: {
//                         gte: new Date(today.setDate(today.getDate() - 7)), // Last 7 days
//                     },
//                 };
//                 break;

//             case 'monthly':
//                 dateFilter = {
//                     createdAt: {
//                         gte: new Date(today.setMonth(today.getMonth() - 1)), // Last 30 days
//                     },
//                 };
//                 break;

//             case 'lifetime':
//                 // No date filter for lifetime, retrieve all records
//                 break;

//             case 'custom':
//                 if (start && end) {
//                     dateFilter = {
//                         createdAt: {
//                             gte: start,
//                             lte: end,
//                         },
//                     };
//                 }
//                 break;

//             default:
//                 // Handle unknown filter, e.g., by returning an error or setting default behavior
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid filter option provided",
//                 });
//         }

//         // Fetch recruiter hiring records based on filters
//         const recruiterHirings = await prisma.recruiterHiring.findMany({
//             where: {
//                 recruiterId: parsedRecruiterId,
//                 ...dateFilter, // Apply date filter conditionally
//             },
//             include: {
//                 employer: {
//                     include: {
//                         Profile: {
//                             select: {
//                                 fullname: true, // Select the full name of the employer from Profile
//                             },
//                         },
//                     },
//                 },
//                 timeSheets: {
//                     select: {
//                         totalPayableAmount: true,
//                         totalAmountDue: true,
//                     },
//                 },
//             },
//         });

//         // Map the results to include the necessary fields and format date and time
//         const result = recruiterHirings.map((record) => {
//             const createdAtDate = new Date(record.createdAt);
//             const date = createdAtDate.toISOString().split('T')[0];
//             const time = createdAtDate.toTimeString().split(' ')[0];

//             return {
//                 id: record.id,
//                 employerName: record.employer?.Profile[0]?.fullname || "N/A",
//                 serviceName: record.serviceName,
//                 date: date,
//                 time: time,
//                 paymentStatus: record.paymentStatus,
//                 totalPayableAmount: record.timeSheets.reduce((sum, sheet) => sum + sheet.totalPayableAmount, 0),
//                 totalAmountDue: record.timeSheets.reduce((sum, sheet) => sum + sheet.totalAmountDue, 0),
//             };
//         });

//         // Respond with the filtered hiring details
//         res.status(200).json({
//             success: true,
//             message: "Hiring records fetched successfully",
//             data: result,
//         });
//     } catch (error) {
//         console.error("Error fetching hiring records:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message,
//         });
//     }
// };

exports.getEarnings = async (req, res) => {
  try {
    const { recruiterId, startDate, endDate } = req.query;

    const parsedRecruiterId = Number(recruiterId);

    // Initialize date filter only if both start and end dates are provided
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}; // Empty object means no date filter

    // Fetch recruiter hiring records based on date range filter (if applied)
    const recruiterHirings = await prisma.recruiterHiring.findMany({
      where: {
        recruiterId: parsedRecruiterId,
        ...dateFilter,
      },
      include: {
        employer: {
          include: {
            Profile: {
              select: {
                fullname: true,
              },
            },
          },
        },
        timeSheets: {
          select: {
            totalPayableAmount: true,
            totalAmountDue: true,
          },
        },
      },
    });

    // Map the results to include the necessary fields and format date and time
    const result = recruiterHirings.map((record) => {
      const createdAtDate = new Date(record.createdAt);
      const date = createdAtDate.toISOString().split("T")[0];
      const time = createdAtDate.toTimeString().split(" ")[0];

      return {
        id: record.id,
        employerName: record.employer?.Profile[0]?.fullname || "N/A",
        serviceName: record.serviceName,
        date: date,
        time: time,
        paymentStatus: record.paymentStatus,
        totalPayableAmount: record.timeSheets.reduce(
          (sum, sheet) => sum + sheet.totalPayableAmount,
          0
        ),
        totalAmountDue: record.timeSheets.reduce(
          (sum, sheet) => sum + sheet.totalAmountDue,
          0
        ),
      };
    });

    // Respond with the filtered hiring details
    res.status(200).json({
      success: true,
      message: "Hiring records fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching hiring records:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  const recruiterId = req.user.userId;
  try {
    const { filter, startDate, endDate } = req.query;

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize filter conditions
    let dateFilter = {};

    // Apply date filter based on `filter` query parameter
    switch (filter) {
      case "today":
        dateFilter = {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          },
        };
        break;
      case "tomorrow":
        dateFilter = {
          createdAt: {
            gte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            lt: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "lastthreedays":
        dateFilter = {
          createdAt: {
            gte: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Three days back from today
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "lastweek":
        dateFilter = {
          createdAt: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days back
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "lastmonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const firstDayCurrentMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        dateFilter = {
          createdAt: {
            gte: firstDayLastMonth,
            lt: firstDayCurrentMonth,
          },
        };
        break;
      case "custom":
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              gte: new Date(startDate),
              lt: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000), // End date inclusive
            },
          };
        } else {
          return res.status(400).json({
            success: false,
            message: "For custom filter, please provide startDate and endDate.",
          });
        }
        break;
    }

    // Fetch recruiter hiring records with filters and recruiterApprovalStatus 'APPROVED'
    const recruiterHirings = await prisma.recruiterHiring.findMany({
      where: {
        recruiterId: Number(recruiterId),
        recruiterApprovalStatus: "APPROVED",
        ...dateFilter,
      },
      include: {
        hiredServices: {
          include: {
            service: true,
          },
        },
        employer: {
          include: {
            Profile: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
    });

    // Format results
    const result = recruiterHirings.map((record) => {
      return {
        id: record.id,
        fullname: record.employer?.Profile[0]?.fullname || "N/A",
        serviceName: record.hiredServices.flatMap(
          (item) => item.service.name
        )[0],
        date: record.createdAt,
        jobStatus: record.jobStatus,
        recruiterApprovalStatus: record.recruiterApprovalStatus,
      };
    });

    // Response with data
    res.status(200).json({
      success: true,
      message: "Hiring records fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching hiring records:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getRecruiterStatsold=async (req, res)=> {
  try {
      // Count the distinct employer IDs in the RecruiterHiring model
      const employerCount = await prisma.recruiterHiring.count({
          distinct: ['employerId'], // Count unique employer IDs
      });

      // Return a properly formatted response
      return res.status(200).json({
          success: true,
          message: "Total number of employers served fetched successfully.",
          data: {
              totalEmployersServed: employerCount,
          },
      });
  } catch (error) {
      console.error('Error counting employers served:', error);

      // Return an error response with details
      return res.status(500).json({
          success: false,
          message: "An error occurred while fetching the total number of employers served.",
          error: error.message,
      });
  } finally {
      await prisma.$disconnect();
  }
}


exports.getRecruiterStatsOLD = async (req, res) => {
  try {
    // Step 1: Count distinct employer IDs
    const employerCount = await prisma.recruiterHiring.groupBy({
      by: ['employerId'], // Group by employerId
    });
    const totalEmployersServed = employerCount.length;

    // Step 2: Calculate total earnings from the `Service` model
    const totalEarnings = await prisma.service.aggregate({
      _sum: {
        pricing: true, // Summing up the `pricing` field from the `Service` model
      },
      where: {
        RecruiterHiring: {
          some: {
            paymentStatus: 'PAID', // Ensure payment status is `PAID`
          },
        },
      },
    });

    // Return a properly formatted response
    return res.status(200).json({
      success: true,
      message: "Recruiter stats fetched successfully.",
      data: {
        totalEmployersServed,
        totalEarnings: totalEarnings._sum.pricing || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);

    // Return an error response with details
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching recruiter stats.",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

exports.getRecruiterStats = async (req, res) => {
  const { recruiterId } = req.params; // Extract recruiterId from request parameters

  try {
    // Step 1: Count distinct employers served by the recruiter
    const employerCount = await prisma.recruiterHiring.groupBy({
      by: ['employerId'], // Group by employerId
      where: {
        recruiterId: parseInt(recruiterId), // Filter by recruiterId
      },
    });
    const totalEmployersServed = employerCount.length;

    // Step 2: Calculate total earnings from the `Service` model for the specific recruiter
    const totalEarnings = await prisma.service.aggregate({
      _sum: {
        pricing: true, // Summing up the `pricing` field from the `Service` model
      },
      where: {
        RecruiterHiring: {
          some: {
            recruiterId: parseInt(recruiterId), // Filter by recruiterId
            paymentStatus: 'PAID', // Ensure payment status is `PAID`
          },
        },
      },
    });

    // Step 3: Calculate the total number of reviews left for the recruiter
    const reviewCount = await prisma.timesheetReview.count({
      where: {
        recruiterHiringId: {
          in: await prisma.recruiterHiring.findMany({
            where: { recruiterId: parseInt(recruiterId) },
            select: { id: true },
          }).then(res => res.map(hiring => hiring.id)), // Fetch all recruiterHiringIds for this recruiter
        },
      },
    });

    // Step 4: Fetch additional details for the recruiter
    // const recruiterDetails = await prisma.user.findUnique({
    //   where: { id: parseInt(recruiterId) },
    //   select: {
    //     id: true,
    //     email: true,
    //     createdAt: true,
    //     updatedAt: true,
    //   },
    // });

    // if (!recruiterDetails) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Recruiter not found.",
    //   });
    // }

    // Return a properly formatted response
    return res.status(200).json({
      success: true,
      message: "Recruiter stats fetched successfully.",
      data: {
      //  recruiterDetails,
        totalEmployersServed,
        totalEarnings: totalEarnings._sum.pricing || 0,
        reviewCount,
      },
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);

    // Return an error response with details
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching recruiter stats.",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};


exports.getBookings = async (req, res) => {
  const { recruiterId } = req.params;
  const type = req.query.type || "upcoming";

  try {
    // Validate recruiterId
    if (isNaN(recruiterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruiter ID.",
      });
    }

    if (!["allbooking", "upcoming"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Allowed values are 'allbooking' or 'upcoming'.",
      });
    }

    const recruiterIdInt = parseInt(recruiterId, 10);
    const currentDate = new Date();

    // Determine filter based on the "type" parameter
    const startDateFilter =
      type !== "allbooking"
        ? {
            startDate: {
              gt: currentDate, // Filter for upcoming bookings
            },
          }
        : {};

    const hiredServices = await prisma.recruiterHiring.findMany({
      where: {
        recruiterId: recruiterIdInt,
      },
      select: {
        hiredServices: {
          where: startDateFilter,
          select: {
            startDate: true,
            serviceName: true,
          },
        },
        employer: {
          select: {
            email: true,
            Profile: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedResponse = hiredServices.map(({ employer, hiredServices }) => ({
      employerEmail: employer?.email || null,
      employerFullName: employer?.Profile[0]?.fullname || null,
      services: hiredServices || [], // Default to an empty array if no services
    }));

    return res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching bookings for recruiterId:", recruiterId, error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookings.",
      error: error.message,
    });
  }
};


exports.getReviews = async (req, res) => {
  const { recruiterId } = req.params; // Get recruiterId from params

  // Pagination parameters: default to page 1 and limit 1 (for the most recent review)
  const page = parseInt(req.query.page) || 1;  // Page number (default: 1)
  const limit = parseInt(req.query.limit) || 1;  // Limit (default: 1)

  try {
    // Fetch reviews based on recruiterId and paginate
    const reviews = await prisma.timesheetReview.findMany({
      where: {
        OR: [
          { RecruiterHiring: { recruiterId: parseInt(recruiterId, 10) } }, // Filter by recruiterId
          { RecruiterHiring: { employerId: parseInt(recruiterId, 10) } },   // Include if recruiterId is for the employer
        ],
      },
      select: {
        content: true,        // Review content
        rating: true,         // Review rating
        createdAt: true,      // Review created date
        recruiterHiringId: true,
        RecruiterHiring: {
          select: {
            recruiter: {
              select: {
                id: true,
                Profile: {
                  select: {
                    fullname: true,  // Recruiter's full name
                    avatarId: true,  // Recruiter's avatar ID
                  },
                },
              },
            },
            employer: {
              select: {
                id: true,
                Profile: {
                  select: {
                    fullname: true,  // Employer's full name
                    avatarId: true,  // Employer's avatar ID
                  },
                },
              },
            },
          },
        },
      },
      take: limit,  // Limit the number of results per page
      skip: (page - 1) * limit,  // Skip results based on the page number
      orderBy: {
        createdAt: 'desc',  // Order by createdAt to get the most recent reviews
      },
    });

    // Format the response
    const formattedReviews = reviews.map((review) => {
      const reviewer = review.RecruiterHiring?.recruiterId === parseInt(recruiterId, 10)
        ? review.RecruiterHiring?.recruiter
        : review.RecruiterHiring?.employer; // Either recruiter or employer reviewed
      return {
        content: review.content,
        rating: review.rating,
        reviewedByFullname: reviewer?.Profile[0]?.fullname || "Unknown",  // Name of the reviewer (recruiter/employer)
        reviewedByAvatarId: reviewer?.Profile[0]?.avatarId || null,      // Avatar of the reviewer
        createdAt: review.createdAt,
      };
    });

    // Return the reviews in a formatted response
    return res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews for recruiterId:", recruiterId, error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching reviews.",
      error: error.message,
    });
  }
};


exports.getRecruiterEarnings = async (req, res) => {
  try {
      const { recruiterId } = req.params;
      const { year } = req.query; // Optional query parameter for filtering by year

      if (!recruiterId) {
          return res.status(400).json({
              success: false,
              message: "Recruiter ID is required.",
          });
      }

      const recruiterIdInt = parseInt(recruiterId, 10); // Ensure recruiterId is an integer

      if (isNaN(recruiterIdInt)) {
          return res.status(400).json({
              success: false,
              message: "Invalid Recruiter ID.",
          });
      }

      // Fetch earnings data from RecruiterHiring and HiredService
      const earnings = await prisma.recruiterHiring.findMany({
          where: {
              recruiterId: recruiterIdInt,
          },
          select: {
              hiredServices: {
                  select: {
                      serviceAmount: true, // Get serviceAmount from HiredService model
                      startDate: true, // For grouping by month/year
                  },
                  orderBy: {
                      startDate: "asc", // Order by startDate in HiredService model
                  },
              },
          },
      });

      // Calculate total, monthly, and yearly earnings
      let totalEarnings = 0;
      const monthlyEarnings = {};
      const yearlyEarnings = {};

      // Flatten and process earnings from timeSheets
      earnings.forEach((recruiter) => {
          recruiter.hiredServices.forEach((earning) => {
              const serviceAmount = earning.serviceAmount || 0; // Default to 0 if no service amount
              totalEarnings += serviceAmount;

              const startDate = new Date(earning.startDate);
              const month = startDate.toLocaleString("default", { month: "long" });
              const yearKey = startDate.getFullYear();

              // Group earnings by month and year
              monthlyEarnings[`${yearKey}-${month}`] = (monthlyEarnings[`${yearKey}-${month}`] || 0) + serviceAmount;
              yearlyEarnings[yearKey] = (yearlyEarnings[yearKey] || 0) + serviceAmount;
          });
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
              totalEarnings: totalEarnings.toFixed(2), // Total earnings rounded to 2 decimal places
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
















