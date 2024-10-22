const { PrismaClient, HiringStatusAdmin, HiringStatusRec, JobStatus } = require('@prisma/client');
const prismaClient = new PrismaClient();

exports.postJob = async (req, res) => {
    try {
        const { startDate, endDate, jobDetail, serviceName, adminApprovalStatus, recruiterApprovalStatus, jobStatus, employerId, serviceId, recruiterId } = req.body;

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
            }
        });

        res.status(201).json({
            success: true,
            message: 'Recruiter Hiring created successfully',
            data: newHiring,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the Recruiter Hiring',
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
            }
        });

        if (!hiring) {
            return res.status(404).json({
                success: false,
                message: 'Hiring not found',
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
            message: 'Admin approval status updated to APPROVED successfully',
            data: updatedHiring,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the admin approval status',
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
                id: true,        // Selecting the 'id' from recruiterHiring
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
                message: 'No hiring records found for this recruiter',
            });
        }

        // Extract employerIds from hiringRecords
        const employerIds = hiringRecords.map(record => record.employerId);

        // Fetch profiles of all employers where userId matches employerId
        const profiles = await prismaClient.profile.findMany({
            where: {
                userId: { in: employerIds }, // Fetch profiles for the employerIds
            },
            select: {
                userId: true,  // Include userId to map with employerId
                fullname: true,  // Fetch the fullname field
            },
        });

        // Create a custom response by mapping hiring records to profiles
        const response = hiringRecords.map(record => {
            const profile = profiles.find(p => p.userId === record.employerId);
            return {
                id: record.id,           // RecruiterHiring ID
                fullname: profile ? profile.fullname : 'N/A', // Profile fullname, fallback if not found
                Datetime: record.updatedAt,
                jobStatus: record.jobStatus,
                adminApprovalStatus: record.adminApprovalStatus,
                recruiterApprovalStatus: record.recruiterApprovalStatus,
               // paymentStatus: paymentStatus
            };
        });

        res.status(200).json({
            success: true,
            message: 'Here is the response',
            data: response, // Returning the custom response
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
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
                id: true,        // Selecting the 'id' from recruiterHiring
                employerId: true, // Selecting the 'employerId'
                startDate: true,
                endDate: true,
                serviceName: true,
                jobDetail: true,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Here is the response',
            data: hiringRecords, // Returning the custom response
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }

}

exports.updateRecApprovalStatus = async (req, res) => {
    try {
        const { hiringId, status } = req.body;
        console.log(hiringId);
        // Find the record first to ensure it exists (optional but good practice)
        const hiring = await prismaClient.recruiterHiring.findUnique({
            where: {
                id: hiringId,
            }
        });

        if (!hiring) {
            return res.status(404).json({
                success: false,
                message: 'Hiring not found',
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
            message: 'Recruiter approval status updated to APPROVED successfully',
            data: updatedHiring,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the admin approval status',
            error: error.message,
        });
    }
};

exports.getUpcommingBookings = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log("User ID:", userId);

        // Fetching all hiring records where recruiterId matches the userId
        const hiringRecords = await prismaClient.recruiterHiring.findMany({
            where: {
                recruiterId: userId,
            },
            select: {
                id: true,        // Selecting the 'id' from recruiterHiring
                employerId: true, // Selecting the 'employerId'
                jobStatus: true,
                startDate: true,
            },
        });

        if (hiringRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hiring records found for this recruiter',
            });
        }

        // Extract employerIds from hiringRecords
        const employerIds = hiringRecords.map(record => record.employerId);

        // Fetch profiles of all employers where userId matches employerId
        const profiles = await prismaClient.profile.findMany({
            where: {
                userId: { in: employerIds }, // Fetch profiles for the employerIds
            },
            select: {
                userId: true,  // Include userId to map with employerId
                fullname: true,  // Fetch the fullname field
            },
        });

        // Create a custom response by mapping hiring records to profiles
        const response = hiringRecords.map(record => {
            const profile = profiles.find(p => p.userId === record.employerId);
            return {
                id: record.id,           // RecruiterHiring ID
                fullname: profile ? profile.fullname : 'N/A', // Profile fullname, fallback if not found
            };
        });

        res.status(200).json({
            success: true,
            message: 'Here is the response',
            data: response, // Returning the custom response
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
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
            }
        });

        if (!hiring) {
            return res.status(404).json({
                success: false,
                message: 'Hiring not found',
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
            message: 'job status sucessfully updated',
            data: updatedHiring,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the admin approval status',
            error: error.message,
        });
    }
};


exports.createTimesheets = async (req, res) => {
    try {
        const {
            recruitingId,
            weeklyTimesheet, // Corrected to match the casing
            independentContracter,
            sendingtoclient,
            sendChargestoFuse,
            managingSupervion,
            recruiterName,
            HiredBy,
            phoneNumber
        } = req.body;

        // Validate recruitingId and weeklyTimesheet input
        if (!recruitingId || !Array.isArray(weeklyTimesheet)) { // Corrected here
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Please provide recruitingId and an array of weekly timesheet data.',
            });
        }

        // Validate that phoneNumber is a string (to handle leading zeroes)
        if (typeof phoneNumber !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid phoneNumber format. It should be a string.',
            });
        }

        // Validate that the boolean values are present
        if (typeof independentContracter !== 'boolean' ||
            typeof sendingtoclient !== 'boolean' ||
            typeof sendChargestoFuse !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid boolean values for independentContracter, sendingtoclient, or sendChargestoFuse.',
            });
        }

        // Create a single timesheet entry and store the entire weeklyTimesheet as JSON in weeklyDatasheet
        const timesheetEntry = {
            recruitingId, // Attach recruitingId from request body
            weeklyTimesheet, // Corrected here
            independentContracter,
            sendingtoclient,
            sendChargestoFuse,
            managingSupervion,
            recruiterName,
            HiredBy,
            phoneNumber
        };

        // Create the timesheet entry using Prisma
        const createdTimesheet = await prismaClient.timeSheet.create({
            data: timesheetEntry,
        });

        res.status(201).json({
            success: true,
            message: 'Timesheet created successfully.',
            data: createdTimesheet, // Return created timesheet record
        });
    } catch (error) {
        console.error('Error creating timesheet:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
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
                message: 'recruitingId is required.',
            });
        }

        const parsedRecruitingId = parseInt(recruitingId, 10);

        // Check if parsedRecruitingId is a valid number
        if (isNaN(parsedRecruitingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recruitingId. It must be a number.',
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
                message: 'No timesheets found for the given recruitingId.',
            });
        }

        // Return the fetched timesheets
        res.status(200).json({
            success: true,
            data: timesheets,
        });
    } catch (error) {
        console.error('Error fetching timesheets:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
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
                message: 'recruitingId is required.',
            });
        }

        // Validate the provided status
        if (!status || !['APPROVED', 'REJECT'].includes(status.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. It must be either "APPROVED" or "REJECT".',
            });
        }

        // Find all the timesheets with the given recruitingId and where the status is "PENDING"
        const pendingTimesheets = await prismaClient.timeSheet.findMany({
            where: {
                recruitingId: parseInt(recruitingId), // Ensure recruitingId is an integer
                approvalStatusEmp: 'PENDING'
            }
        });

        // If no pending timesheets are found
        if (pendingTimesheets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No timesheets found with PENDING status for the given recruitingId.',
            });
        }

        // Update all timesheets with PENDING status to the new status (APPROVE or REJECT)
        const updatedTimesheets = await prismaClient.timeSheet.updateMany({
            where: {
                recruitingId: parseInt(recruitingId),
                approvalStatusEmp: 'PENDING'
            },
            data: {
                approvalStatusEmp: status.toUpperCase() // Set the new status
            }
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: `Timesheet approval status updated to ${status.toUpperCase()} for ${updatedTimesheets.count} timesheets.`,
        });
    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};


exports.getdetial=async(req,res) =>{

};


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
                message: 'No recruiter hiring details found for the given ID',
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
                phnumber:true
            },
        });

        
        console.log('HireBy :', employerProfile?.fullname || 'Not Found');
        console.log('phoneNumber :', employerProfile?.phonenumber || 'Not Found');
        console.log('RecruiterName:', recProfile?.fullname || 'Not Found');

        const result={
            "hireBy":employerProfile?.fullname || 'N/A',
            "phoneNumber":employerProfile?.phonenumber || 'N/A',
"RecruiterName":recProfile?.fullname || 'N/A',
        }
        // Respond with the fetched details
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching recruiter and employer details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};









