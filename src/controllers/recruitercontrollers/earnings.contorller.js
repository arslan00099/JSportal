const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    const { recruiterId, startDate, endDate } = req.query; // Accept only required query params

    // Parse recruiterId and filter dates if provided
    const parsedRecruiterId = Number(recruiterId);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Check if both start and end dates are provided
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required.",
      });
    }

    // Date range filter
    const dateFilter = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    // Fetch recruiter hiring records based on date range filter
    const recruiterHirings = await prisma.recruiterHiring.findMany({
      where: {
        recruiterId: parsedRecruiterId,
        ...dateFilter, // Apply date filter
      },
      include: {
        employer: {
          include: {
            Profile: {
              select: {
                fullname: true, // Select the full name of the employer from Profile
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
