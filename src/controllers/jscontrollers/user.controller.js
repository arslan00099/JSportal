// src/controllers/user.controller.js
const userViewModel = require('../../viewmodels/jsviewmodels/profile.viewmodel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.postProfile = async (req, res) => {
  try {
    const { fullname, phnumber } = req.body;
    const { userId, role } = req.user;
    const phoneNumber = parseInt(phnumber, 12);

    // Check if a file is uploaded
    let avatarId = null;
    if (req.file) {
      avatarId = req.file.filename; // Save the file name to use as avatarId
    }

    const result = await userViewModel.basicprofile(userId, fullname, phoneNumber, avatarId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.uploadDocuments = async (req, res) => {
  try {
    const { websiteLink, additionalLink } = req.body;
    const { userId } = req.user;

    // Extract file paths for resume and portfolio (both are optional)
    const resumePath = req.files?.resume?.[0]?.filename || null;
    const portfolioPath = req.files?.portfolio?.[0]?.filename || null;

    // Call the InsertDocuments function with all optional fields
    const result = await userViewModel.InsertDocuments(
      userId,
      resumePath,
      portfolioPath,
      websiteLink || null,
      additionalLink || null
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const userProfile = await userViewModel.getProfile(userId);

    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Construct the URL to access the profile picture
    if (userProfile.avatarId) {
      userProfile.profilePhotoUrl = `${req.protocol}://${req.get('host')}/utils/profilephotos/${userProfile.avatarId}`;
    }

    res.status(200).json({ success: true, data: userProfile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    console.log("inside delete controller");
    const { userId, role } = req.user;
    console.log("**************");
    console.log(userId);
    const result = await userViewModel.deleteProfile(userId);
    res.status(200).json({ sucess: true, data: result })
  }
  catch (error) {
    console.log("catch error for deleteProfile");
    res.status(400).json({ sucess: false, message: error.message })
  }
}

exports.postEducation = async (req, res) => {
  try {
    console.log("added into education tab");
    const { degree, institution, description, from, to } = req.body;
    const { userId, role } = req.user;
    console.log(userId);
    const result = await userViewModel.insertEducation(degree, institution, description, from, to, userId);
    res.status(200).json({ success: true, data: result });

  }
  catch (error) {
    console.log("catch for education");
    res.status(400).json({ sucess: false, message: error.message });
  }
}

exports.updateEducation = async (req, res) => {
  try {
    const { educationId, degree, institution, description, from, to } = req.body;
    const { userId, role } = req.user;
    const result = await userViewModel.updateEducation(educationId, degree, institution, description, from, to, userId);
    res.status(200).json({ success: true, data: result });
  }
  catch (error) {
    console.log("catch for education");
    res.status(400).json({ sucess: false, message: error.message });
  }
}

exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.body;
    const { userId, role } = req.user;
    console.log("**************");
    console.log(userId);
    const result = await userViewModel.deleteEducation(userId, educationId);
    res.status(200).json({ sucess: true, data: result })
  }
  catch (error) {
    console.log("catch error for deleteProfile");
    res.status(400).json({ sucess: false, message: error.message })
  }
}

exports.insertCertificate = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from the authenticated user
    const { certName, orgName, description, from, to } = req.body; // Extract data from request body

    console.log("Inserting certificate for user:", userId);

    // Call the view model or service layer function to insert the certificate
    const result = await userViewModel.insertCertificate(certName, orgName, description, from, to, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error during certificate insertion:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from the authenticated user
    const { certificateId, certName, orgName, description, from, to } = req.body; // Extract data from request body

    console.log("Inserting certificate for user:", userId);

    // Call the view model or service layer function to insert the certificate
    const result = await userViewModel.updateCertificate(certificateId, certName, orgName, description, from, to, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error during certificate insertion:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deleteCertificate = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from a decoded JWT or session
    const { certificateId } = req.body;
    console.log("Deleting certificate for user:", userId);

    const result = await userViewModel.deleteCertificate(userId, certificateId); // Call the delete function from the viewModel or service layer

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error during certificate deletion:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};




exports.insertEmploymentHistory = async (req, res) => {
  try {
    const { company, jobTitle, description, startedOn, endOn } = req.body;
    const { userId } = req.user;

    const result = await userViewModel.insertEmploymentHistory(
      company, jobTitle, description, startedOn, endOn, userId
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error inserting employment history:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEmploymentHistory = async (req, res) => {
  try {
    const { employmentId, company, jobTitle, description, startedOn, endOn } = req.body;
    const { userId } = req.user;

    const result = await userViewModel.updateEmploymentHistory(employmentId,
      company, jobTitle, description, startedOn, endOn, userId
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error updating employment history:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Employment History by userId
exports.getEmploymentHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { employmentId } = req.body;

    const result = await userViewModel.getEmploymentHistory(userId, employmentId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Employment history not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching employment history:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



// Delete Employment History by userId
exports.deleteEmploymentHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { employmentId } = req.body;

    const result = await userViewModel.deleteEmploymentHistory(userId, employmentId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error deleting employment history:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// Controller for adding a new location
exports.addLocation = async (req, res) => {
  const { city, state, country, postalCode } = req.body;
  const { userId } = req.user;
  try {
    const location = await userViewModel.addLocation(userId, city, state, country, postalCode);
    res.status(201).json({ success: true, message: location });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for deleting a location by ID
exports.deleteLocation = async (req, res) => {
  const { userId } = req.user;
  console.log("userId");
  try {
    const deletedLocation = await userViewModel.deleteLocation(userId);
    res.status(200).json({ success: true, data: deletedLocation });
  } catch (error) {
    res.status(400).json({ sucess: false, error: error.message });
  }
};

// Controller for getting locations by userId
exports.getLocations = async (req, res) => {
  const { userId } = req.user;
  try {
    const locations = await userViewModel.getLocations(parseInt(userId));
    res.status(200).json(locations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from a decoded JWT or session


    const result = await userViewModel.deleteDocument(userId); // Call the delete function from the viewModel or service layer

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error during certificate deletion:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



exports.createMentorSession = async (req, res) => {
  const { selectedService, mentorId } = req.body;
  let { userId } = req.user;

  try {
    // Ensure selectedDateTime is in ISO-8601 format
  //  const formattedDateTime = new Date(selectedDateTime).toISOString();

    // Fetch the service name from the selectedService ID
    const service = await prisma.service.findUnique({
      where: { id: selectedService }, // Find service by ID
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const servicename = service.name;

    // Create the mentor session with the correct date format
    const newSession = await prisma.mentorSessionManagement.create({
      data: {
        selectedService,
        userId,
        mentorProfileId: mentorId,
      },
    });

    // Pass the new session ID to the notification creation function
    const notificationResponse = await createNotification(
      userId,
      servicename,
      `Your session for ${servicename} has been booked!`,
      mentorId,
      newSession.id // Pass the mentorSessionManagement ID
    );

    res.status(201).json({
      success: true,
      data: newSession,
      notification: notificationResponse.notification,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


const createNotification = async (userId, title, message, mentorId = null, mentorSessionManagmentId = null) => {
  try {
    // Log the incoming parameters for debugging
    console.log("UserID:", userId);
    console.log("Title:", title);
    console.log("Message:", message);
    console.log("MentorID:", mentorId);
    console.log("MentorSessionManagementID:", mentorSessionManagmentId);

    // Create the notification
    const newNotification = await prisma.notification.create({
      data: {
        title,
        message,
        userId,
        mentorId,
        mentorSessionManagmentId,
      },
    });

    return { notification: newNotification };
  } catch (error) {
    throw new Error(`Error creating notification: ${error.message}`);
  }
};




exports.fetchMentorSession = async (req, res) => {

  let { userId } = req.user;
  console.log(userId);
  try {
    const newSession = await userViewModel.getBookedMentorSessions(
      userId
    );
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
