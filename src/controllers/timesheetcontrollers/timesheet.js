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
                employerId: true // Selecting the 'employerId'
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

exports.getDetails = async (req, res) => {
    //const { userId } = req.user;
    const {hiringId}=req.query;
    const hiringIdInt = parseInt(hiringId, 10);
    console.log(hiringId);
    try {
        const hiringRecords = await prismaClient.recruiterHiring.findMany({
            where: {
               // recruiterId: userId,
                id:hiringIdInt,
            },
            select: {
                id: true,        // Selecting the 'id' from recruiterHiring
                employerId: true, // Selecting the 'employerId'
                startDate: true,
                endDate: true,
                serviceName:true,
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

