const {
  PrismaClient,
  HiringStatusAdmin,
  HiringStatusRec,
  JobStatus,
} = require("@prisma/client");
const prismaClient = new PrismaClient();

exports.postJob = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      jobDetail,
      serviceName,
      adminApprovalStatus,
      recruiterApprovalStatus,
      jobStatus,
      employerId,
      serviceId,
      recruiterId,
    } = req.body;

    // Create a new RecruiterHiring record
    const newHiring = await prismaClient.recruiterHiring.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        jobDetail: jobDetail,
        serviceName: serviceName,
        adminApprovalStatus: "PENDING",
        recruiterApprovalStatus: "PENDING",
        jobStatus: "OPEN",
        paymentStatus: "PENDING",
        employerId: employerId,
        serviceId: serviceId,
        recruiterId: recruiterId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Recruiter Hiring created successfully",
      data: newHiring,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the Recruiter Hiring",
      error: error.message,
    });
  }
};

exports.updateAdminApprovalStatus = async (req, res) => {
  try {
    const { hiringId, status } = req.body;
    console.log(hiringId);
    // Find the record first to ensure it exists (optional but good practice)
    const hiring = await prismaClient.recruiterHiring.findUnique({
      where: {
        id: hiringId,
      },
    });

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    // Update the admin approval status to "APPROVED"
    const updatedHiring = await prismaClient.recruiterHiring.update({
      where: {
        id: hiringId,
      },
      data: {
        adminApprovalStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Admin approval status updated to APPROVED successfully",
      data: updatedHiring,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the admin approval status",
      error: error.message,
    });
  }
};

exports.getRecNotification = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("User ID:", userId);

    // Fetching all hiring records where recruiterId matches the userId
    const hiringRecords = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: userId,
      },
      select: {
        id: true, // Selecting the 'id' from recruiterHiring
        employerId: true, // Selecting the 'employerId'
        updatedAt: true,
        jobStatus: true,
        adminApprovalStatus: true,
        recruiterApprovalStatus: true,
        // paymentStatus: true,
      },
    });

    if (hiringRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hiring records found for this recruiter",
      });
    }

    // Extract employerIds from hiringRecords
    const employerIds = hiringRecords.map((record) => record.employerId);

    // Fetch profiles of all employers where userId matches employerId
    const profiles = await prismaClient.profile.findMany({
      where: {
        userId: { in: employerIds }, // Fetch profiles for the employerIds
      },
      select: {
        userId: true, // Include userId to map with employerId
        fullname: true, // Fetch the fullname field
      },
    });

    // Create a custom response by mapping hiring records to profiles
    const response = hiringRecords.map((record) => {
      const profile = profiles.find((p) => p.userId === record.employerId);
      return {
        id: record.id, // RecruiterHiring ID
        fullname: profile ? profile.fullname : "N/A", // Profile fullname, fallback if not found
        Datetime: record.updatedAt,
        jobStatus: record.jobStatus,
        adminApprovalStatus: record.adminApprovalStatus,
        recruiterApprovalStatus: record.recruiterApprovalStatus,
        // paymentStatus: paymentStatus
      };
    });

    res.status(200).json({
      success: true,
      message: "Here is the response",
      data: response, // Returning the custom response
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getDetails = async (req, res) => {
  //const { userId } = req.user;
  const { hiringId } = req.query;
  const hiringIdInt = parseInt(hiringId, 10);
  console.log(hiringId);
  try {
    const hiringRecords = await prismaClient.recruiterHiring.findMany({
      where: {
        // recruiterId: userId,
        id: hiringIdInt,
      },
      select: {
        id: true, // Selecting the 'id' from recruiterHiring
        employerId: true, // Selecting the 'employerId'
        startDate: true,
        endDate: true,
        serviceName: true,
        jobDetail: true,
        recruiterApprovalStatus: true,
      },
    });
    res.status(200).json({
      success: true,
      data: hiringRecords,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateRecApprovalStatus = async (req, res) => {
  try {
    const { hiringId, status } = req.body;
    console.log(hiringId);
    // Find the record first to ensure it exists (optional but good practice)
    const hiring = await prismaClient.recruiterHiring.findUnique({
      where: {
        id: hiringId,
      },
    });

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    // Update the admin approval status to "APPROVED"
    const updatedHiring = await prismaClient.recruiterHiring.update({
      where: {
        id: hiringId,
      },
      data: {
        recruiterApprovalStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Recruiter approval status updated to APPROVED successfully",
      data: updatedHiring,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the admin approval status",
      error: error.message,
    });
  }
};

exports.getUpcomingBookings = async (req, res) => {
  console.log("fetching upcomming bookings");
  try {
    const { userId } = req.user;
    const { startDate, endDate } = req.query; // Get startDate and endDate from query parameters
    console.log("User ID:", userId);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Build the filters for the query
    const filters = {
      recruiterId: userId,
    };

    // Add createdAt date range filters if provided
    if (startDate || endDate) {
      filters.createdAt = {}; // Initialize createdAt filter

      if (startDate) {
        filters.createdAt.gte = new Date(startDate); // Greater than or equal to startDate
      }

      if (endDate) {
        filters.createdAt.lte = new Date(endDate); // Less than or equal to endDate
      }
    }

    // Fetching all hiring records based on the filters
    const hiringRecords = await prismaClient.recruiterHiring.findMany({
      where: filters,
      select: {
        id: true,
        employerId: true,
        jobStatus: true,
        startDate: true,
        serviceName: true,
        createdAt: true,
      },
    });

    if (hiringRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hiring records found for this recruiter",
      });
    }

    // Extract employerIds from hiringRecords
    const employerIds = hiringRecords.map((record) => record.employerId);

    // Fetch profiles of all employers where userId matches employerId
    const profiles = await prismaClient.profile.findMany({
      where: {
        userId: { in: employerIds },
      },
      select: {
        userId: true,
        fullname: true,
      },
    });

    // Create a custom response by mapping hiring records to profiles
    const result = hiringRecords.map((record) => {
      const profile = profiles.find((p) => p.userId === record.employerId);
      return {
        id: record.id,
        fullname: profile ? profile.fullname : "N/A",
        serviceName: record.serviceName,
        datetime: record.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Here is the response",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.markedasCompleted = async (req, res) => {
  try {
    const { hiringId, jobstatus } = req.body;
    console.log(hiringId);
    // Find the record first to ensure it exists (optional but good practice)
    const hiring = await prismaClient.recruiterHiring.findUnique({
      where: {
        id: hiringId,
      },
    });

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    // Update the admin approval status to "APPROVED"
    const updatedHiring = await prismaClient.recruiterHiring.update({
      where: {
        id: hiringId,
      },
      data: {
        jobStatus: jobstatus,
      },
    });

    res.status(200).json({
      success: true,
      message: "job status sucessfully updated",
      data: updatedHiring,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the admin approval status",
      error: error.message,
    });
  }
};

exports.createTimesheets = async (req, res) => {
  try {
    const {
      recruitingId,
      weeklyTimesheet, // Corrected to match the casing
      totalHourWorked,
      totalAmountDue,
      totalPayableAmount,
      independentContracter,
      sendingtoclient,
      sendChargestoFuse,
      managingSupervion,
      recruiterName,
      HiredBy,
      phoneNumber,
    } = req.body;

    // Validate recruitingId and weeklyTimesheet input
    if (!recruitingId || !Array.isArray(weeklyTimesheet)) {
      // Corrected here
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. Please provide recruitingId and an array of weekly timesheet data.",
      });
    }

    // Validate that phoneNumber is a string (to handle leading zeroes)
    if (typeof phoneNumber !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid phoneNumber format. It should be a string.",
      });
    }

    // Validate that the boolean values are present
    if (
      typeof independentContracter !== "boolean" ||
      typeof sendingtoclient !== "boolean" ||
      typeof sendChargestoFuse !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid boolean values for independentContracter, sendingtoclient, or sendChargestoFuse.",
      });
    }

    // Create a single timesheet entry and store the entire weeklyTimesheet as JSON in weeklyDatasheet
    const timesheetEntry = {
      recruitingId, // Attach recruitingId from request body
      weeklyTimesheet, // Corrected here
      totalHourWorked,
      totalAmountDue,
      totalPayableAmount,
      independentContracter,
      sendingtoclient,
      sendChargestoFuse,
      managingSupervion,
      recruiterName,
      HiredBy,
      phoneNumber,
    };

    // Create the timesheet entry using Prisma
    const createdTimesheet = await prismaClient.timeSheet.create({
      data: timesheetEntry,
    });

    res.status(201).json({
      success: true,
      message: "Timesheet created successfully.",
      data: createdTimesheet, // Return created timesheet record
    });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getTimesheetsByRecruitingId = async (req, res) => {
  try {
    const { recruitingId } = req.query; // Get recruitingId from query parameters

    // Validate that recruitingId is provided and is a valid number
    if (!recruitingId) {
      return res.status(400).json({
        success: false,
        message: "recruitingId is required.",
      });
    }

    const parsedRecruitingId = parseInt(recruitingId, 10);

    // Check if parsedRecruitingId is a valid number
    if (isNaN(parsedRecruitingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruitingId. It must be a number.",
      });
    }

    // Fetch timesheets based on recruitingId
    const timesheets = await prismaClient.timeSheet.findMany({
      where: {
        recruitingId: parsedRecruitingId, // Use the parsed integer
      },
      select: {
        id: true, // Add any other fields you want to include in the response
        weeklyTimesheet: true,
        approvalStatusEmp: true,
        independentContracter: true,
        sendingtoclient: true,
        sendChargestoFuse: true,
        managingSupervion: true,
        recruiterName: true,
        HiredBy: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no timesheets found
    if (timesheets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timesheets found for the given recruitingId.",
      });
    }

    // Return the fetched timesheets
    res.status(200).json({
      success: true,
      data: timesheets,
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.approveTimesheet = async (req, res) => {
  try {
    const { recruitingId, status } = req.body; // Get recruitingId and status from the request body

    // Validate that recruitingId is provided
    if (!recruitingId) {
      return res.status(400).json({
        success: false,
        message: "recruitingId is required.",
      });
    }

    // Validate the provided status
    if (!status || !["APPROVED", "REJECT"].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. It must be either "APPROVED" or "REJECT".',
      });
    }

    // Find all the timesheets with the given recruitingId and where the status is "PENDING"
    const pendingTimesheets = await prismaClient.timeSheet.findMany({
      where: {
        recruitingId: parseInt(recruitingId), // Ensure recruitingId is an integer
        approvalStatusEmp: "PENDING",
      },
    });

    // If no pending timesheets are found
    if (pendingTimesheets.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No timesheets found with PENDING status for the given recruitingId.",
      });
    }

    // Update all timesheets with PENDING status to the new status (APPROVE or REJECT)
    const updatedTimesheets = await prismaClient.timeSheet.updateMany({
      where: {
        recruitingId: parseInt(recruitingId),
        approvalStatusEmp: "PENDING",
      },
      data: {
        approvalStatusEmp: status.toUpperCase(), // Set the new status
      },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: `Timesheet approval status updated to ${status.toUpperCase()} for ${
        updatedTimesheets.count
      } timesheets.`,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getdetial = async (req, res) => {};

exports.getRecruiterAndEmployerDetailsByHiringId = async (req, res) => {
  try {
    const { id } = req.query; // Get id from query parameters

    // Fetching recruiter hiring details by the given id
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        id: Number(id), // Convert id to number if it's not already
      },
      include: {
        employer: {
          select: {
            id: true,
          },
        },
        recruiter: {
          select: {
            id: true,
          },
        },
      },
    });

    // Check if any recruiter hiring details were found
    if (recruiterHirings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recruiter hiring details found for the given ID",
      });
    }

    // Log employer and recruiter IDs
    const employerId = recruiterHirings[0].employer?.id; // Use optional chaining in case employer is null
    const recruiterId = recruiterHirings[0].recruiter?.id; // Use optional chaining in case recruiter is null

    // Fetch the full name of the employer from the profile model
    const employerProfile = await prismaClient.profile.findUnique({
      where: {
        userId: employerId, // Assuming userId is the field that links to the employer
      },
      select: {
        fullname: true, // Select the fullName field
        phnumber: true,
      },
    });

    const recProfile = await prismaClient.profile.findUnique({
      where: {
        userId: recruiterId, // Assuming userId is the field that links to the employer
      },
      select: {
        fullname: true, // Select the fullName field
        phnumber: true,
      },
    });

    console.log("HireBy :", employerProfile?.fullname || "Not Found");
    console.log("phoneNumber :", employerProfile?.phonenumber || "Not Found");
    console.log("RecruiterName:", recProfile?.fullname || "Not Found");

    const result = {
      hireBy: employerProfile?.fullname || "N/A",
      phoneNumber: employerProfile?.phonenumber || "N/A",
      RecruiterName: recProfile?.fullname || "N/A",
    };
    // Respond with the fetched details
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching recruiter and employer details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getTimeSheetsByRecruiterId = async (req, res) => {
  try {
    const { recruiterId } = req.query; // Get recruiterId from query parameters

    // Fetching all recruiter hiring records by the given recruiterId
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: Number(recruiterId), // Convert recruiterId to number if it's not already
      },
      include: {
        timeSheets: true, // Include related TimeSheet data
      },
    });

    // Check if any recruiter hiring details were found
    if (recruiterHirings.length === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: "No recruiter hiring details found for the given recruiter ID",
      //   });
      return res.status(200).json([]);
    }

    // Extracting all timesheets from the recruiter hirings
    const timeSheets = recruiterHirings.flatMap((hiring) => hiring.timeSheets);

    // Respond with the fetched timesheets
    res.status(200).json({
      success: true,
      data: timeSheets,
    });
  } catch (error) {
    console.error("Error fetching timesheet details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProgressRole = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is provided in req.user

    // Fetching recruiter hiring records
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: Number(userId), // Convert userId to number
      },
      include: {
        employer: {
          select: {
            id: true, // Include employer ID
            createdAt: true, // Include createdAt date
          },
        },
      },
    });

    // Check if any recruiter hiring details were found
    if (recruiterHirings.length === 0) {
      // return res.status(404).json({
      //     success: false,
      //     message: 'No recruiter hiring details found for the given recruiter ID',
      // });
      return res.status(200).json([]);
    }

    // Fetch the full name of the employer for each recruiter hiring record
    const results = await Promise.all(
      recruiterHirings.map(async (hiring) => {
        const employerProfile = await prismaClient.profile.findUnique({
          where: {
            userId: hiring.employer.id, // Assuming userId links to the employer
          },
          select: {
            fullname: true, // Select the fullname field
            companyName: true,
          },
        });

        // Format the date to return only the date part (YYYY-MM-DD)
        const formattedDate = new Date(hiring.createdAt)
          .toISOString()
          .split("T")[0];

        return {
          bookingId: hiring.id, // Booking ID
          employerName: employerProfile?.fullname || "N/A", // Employer's fullname
          date: formattedDate, // Formatted date (YYYY-MM-DD)
        };
      })
    );

    // Respond with the fetched details
    res.status(200).json({
      success: true,
      message: "Progess role fetched successfully",
      data: results, // Return all results in an array
    });
  } catch (error) {
    console.error("Error fetching recruiter hiring details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getRole = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is provided in req.user

    // Fetching recruiter hiring records
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: Number(userId), // Convert userId to number
      },
      include: {
        employer: {
          select: {
            id: true, // Include employer ID
            createdAt: true, // Include createdAt date
          },
        },
      },
    });

    // Check if any recruiter hiring details were found
    if (recruiterHirings.length === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: "No recruiter hiring details found for the given recruiter ID",
      //   });
      return res.status(200).json([]);
    }

    // Fetch the full name of the employer for each recruiter hiring record
    const results = await Promise.all(
      recruiterHirings.map(async (hiring) => {
        const employerProfile = await prismaClient.profile.findUnique({
          where: {
            userId: hiring.employer.id, // Assuming userId links to the employer
          },
          select: {
            fullname: true, // Select the fullname field
            companyName: true,
          },
        });

        // Format the date to return only the date part (YYYY-MM-DD)
        const formattedDate = new Date(hiring.createdAt)
          .toISOString()
          .split("T")[0];

        return {
          bookingId: hiring.id, // Booking ID
          CompanyName: employerProfile?.companyName || "N/A", // Employer's fullname
          date: formattedDate, // Formatted date (YYYY-MM-DD)
        };
      })
    );

    // Respond with the fetched details
    res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: results, // Return all results in an array
    });
  } catch (error) {
    console.error("Error fetching recruiter hiring details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.addTimeSheet = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is provided in req.user

    // Fetching recruiter hiring records
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: Number(userId), // Convert userId to number
      },
      include: {
        employer: {
          select: {
            id: true, // Include employer ID
            createdAt: true, // Include createdAt date
          },
        },
      },
    });

    // Check if any recruiter hiring details were found
    if (recruiterHirings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recruiter hiring details found for the given recruiter ID",
      });
    }

    // Fetch the full name of the employer for each recruiter hiring record
    const results = await Promise.all(
      recruiterHirings.map(async (hiring) => {
        const employerProfile = await prismaClient.profile.findUnique({
          where: {
            userId: hiring.employer.id, // Assuming userId links to the employer
          },
          select: {
            fullname: true, // Select the fullname field
            companyName: true,
          },
        });

        // Format the date to return only the date part (YYYY-MM-DD)
        const formattedDate = new Date(hiring.createdAt)
          .toISOString()
          .split("T")[0];

        return {
          bookingId: hiring.id, // Booking ID
          employerName: employerProfile?.fullname || "N/A", // Employer's fullname
          date: formattedDate, // Formatted date (YYYY-MM-DD)
        };
      })
    );

    // Respond with the fetched details
    res.status(200).json({
      success: true,
      message: "Timesheet list fethced successfully",
      data: results, // Return all results in an array
    });
  } catch (error) {
    console.error("Error fetching recruiter hiring details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.viewTimeSheet = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is provided in req.user
    console.log(userId);
    // Fetching recruiter hiring records
    const recruiterHirings = await prismaClient.recruiterHiring.findMany({
      where: {
        recruiterId: Number(userId), // Assuming recruiterId is the field linking to the recruiter
      },
      include: {
        recruiter: {
          select: {
            fullname: true, // Select the full name of the recruiter
          },
        },
        employer: {
          select: {
            fullname: true, // Select the full name of the employer
          },
        },
      },
    });

    // Check if any timesheets were found
    if (timesheets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timesheets found for the given ID",
      });
    }

    // Map the timesheets to the desired response structure
    const result = timesheets.map((timesheet) => ({
      timesheetId: timesheet.id, // Assuming the timesheet has an id field
      bookingId: timesheet.bookingId, // Assuming there is a bookingId field
      recruiterName: timesheet.recruiter?.fullname || "N/A", // Using optional chaining
      employerName: timesheet.employer?.fullname || "N/A", // Using optional chaining
      date: timesheet.date, // Assuming there's a date field
    }));

    // Respond with the fetched timesheet details
    res.status(200).json({
      success: true,
      message: "Timesheet list fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching timesheet details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
