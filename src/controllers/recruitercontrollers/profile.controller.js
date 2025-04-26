// src/controllers/user.controller.js
//const userViewModel = require('../../viewmodels/mentorviewmodels/profile.viewmodel');
const { generateAvatarUrl, generateResumeUrl, generateVideoUrl } = require("../../url");
const userViewModel = require("../../viewmodels/mentorviewmodels/profile.viewmodel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.postProfile = async (req, res) => {
  try {
    const { fullname, phnumber, services, industry, about, language, tagline, location } =
      req.body;
    const { userId } = req.user;


    // Check if a file is uploaded
    let avatarId = null;
    if (req.file) {
      avatarId = req.file.filename; // Save the file name to use as avatarId
    }



    // Check if the user profile already exists
    const userExists = await prisma.profile.findUnique({ where: { userId } });

    // Data to update or create
    let updateData = {
      fullname,
      phnumber,
      tagline,
      about,
      language,
      services,
      industry,
      location,
    };

    // Only add avatarId if a file is uploaded
    if (avatarId) {
      updateData.avatarId = avatarId;
    }

    let userProfile;
    if (userExists) {
      // Update the existing user profile
      userProfile = await prisma.profile.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // Create a new profile if the user doesn't exist
      userProfile = await prisma.profile.create({
        data: {
          userId,
          fullname,
          phnumber,
          tagline,
          about,
          language,
          services,
          industry,
          avatarId,
          location,
        },
      });
    }

    // If the avatarId exists in the profile, append the base URL to it
    if (userProfile.avatarId) {
      console.log("test");
      userProfile.avatarId = generateAvatarUrl(userProfile.avatarId);

    }

    // Remove fields with null or undefined values
    const filteredProfile = Object.fromEntries(
      Object.entries(userProfile).filter(([_, v]) => v != null)
    );

    res.status(200).json({ success: true, data: filteredProfile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  const { userId } = req.user;

  try {
    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Profile: true, // Fetch related Profile data
        Education: true,
        Certificate: true,
        Location: true,
        EmpolymentHistory: true,
        services: true,
        Documents: true, // Include Documents relation
        Notification: {
          include: {
            Review: true, // Fetch related Review data for each Notification
          },
        },
      },
    });

    // If no user found, return null or handle as needed
    if (!userDetails) {
      throw new Error("User not found");
    }


    // Add full URL for avatar and mentor video link
    if (userDetails.Profile && userDetails.Profile.length > 0) {
      userDetails.Profile.forEach((profile) => {
        if (profile.avatarId) {
          profile.avatarId = generateAvatarUrl(profile.avatarId);
        }
        if (profile.mentorvideolink) {
          profile.mentorvideolink = generateVideoUrl(profile.mentorvideolink);
        }
      });
    }

    // Add full URL for resume and portfolio documents (check if Documents exist first)
    if (userDetails.Documents && userDetails.Documents.length > 0) {
      userDetails.Documents.forEach((document) => {
        if (document.resumeLink) {
          document.resumeUrl = generateResumeUrl(document.resumeLink);
        }
        if (document.portfolioLink) {
          document.portfolioUrl = generateResumeUrl(document.portfolioLink);
        }
      });
    }

    // Format reviews under notifications
    if (userDetails.Notification && userDetails.Notification.length > 0) {
      userDetails.Notification.forEach((notification) => {
        if (notification.Review && notification.Review.length > 0) {
          notification.Reviews = notification.Review.map((review) => ({
            id: review.id,
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
          }));
        } else {
          notification.Reviews = [];
        }
      });
    }

    // Remove sensitive data
    delete userDetails.password;

    res.status(200).json({
      success: true,
      data: {
        ...userDetails,
        Profile: userDetails.Profile.map((item) => ({
          ...item,

        })),
      },
    });
  } catch (error) {
    throw new Error("Error fetching user details: " + error.message);
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is set in the request user object

    // Check if the user profile exists
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // Delete the user profile
    await prisma.profile.delete({
      where: { userId },
    });

    res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.postEducation = async (req, res) => {
  try {
    console.log("Adding education details");

    // Destructure data from the request body
    const { degree, institution, description, from, to } = req.body;
    const { userId, role } = req.user;
    console.log(userId);

    // Parse the dates into ISO strings
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();
    console.log(fromDate);
    console.log(toDate);

    // Create a new education entry in the database
    const newEducation = await prisma.education.create({
      data: {
        degreName: degree,
        universityName: institution,
        description,
        startFrom: fromDate,
        endIn: toDate,
        userId: userId,
      },
    });

    // Update the user's firstLogin status to false
    await prisma.user.update({
      where: { id: userId },
      data: { firstLogin: false },
    });

    // Send a success response with the new education data
    res.status(200).json({ success: true, data: newEducation });
  } catch (error) {
    console.log("Error adding education details");
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { educationId, degree, institution, description, from, to } =
      req.body;

    // Parse the dates into ISO strings if they are provided
    const fromDate = from ? new Date(from).toISOString() : undefined;
    const toDate = to ? new Date(to).toISOString() : undefined;

    // Check if the education record exists
    const educationExists = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!educationExists) {
      return res
        .status(404)
        .json({ success: false, message: "Education record not found" });
    }

    // Update the education record
    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: {
        degreName: degree || educationExists.degreName,
        universityName: institution || educationExists.universityName,
        description: description || educationExists.description,
        startFrom: fromDate || educationExists.startFrom,
        endIn: toDate || educationExists.endIn,
      },
    });

    res.status(200).json({ success: true, data: updatedEducation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.body; // Assuming the education ID is passed as a URL parameter

    // Check if the education record exists
    const educationExists = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!educationExists) {
      return res
        .status(404)
        .json({ success: false, message: "Education record not found" });
    }

    // Delete the education record
    await prisma.education.delete({
      where: { id: educationId },
    });

    res.status(200).json({
      success: true,
      message: "Education record deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.insertCertificate = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from the authenticated user
    const { certName, orgName, description, from, to } = req.body; // Extract data from request body

    console.log("Inserting certificate for user:", userId);

    // Convert the `from` and `to` dates to ISO strings
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();

    // Insert the certificate using Prisma ORM
    const newCertificate = await prisma.certificate.create({
      data: {
        certName: certName,
        orgName: orgName,
        description: description, // Optional certificate description
        startedOn: fromDate,
        completedOn: toDate,
        userId: userId, // Foreign key to user
      },
    });

    res.status(201).json({
      success: true,
      data: newCertificate,
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
    const { certificateId, certName, orgName, description, from, to } =
      req.body;
    const { userId } = req.user;

    // Check if the certificate exists and belongs to the user
    const certificateExists = await prisma.certificate.findFirst({
      where: { id: certificateId, userId },
    });

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or access denied",
      });
    }

    // Convert dates to ISO format if provided
    const updatedData = {
      certName,
      orgName,
      description,
      startedOn: from ? new Date(from).toISOString() : undefined,
      completedOn: to ? new Date(to).toISOString() : undefined,
    };

    // Remove undefined fields (i.e., fields that were not provided in the update)
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    // Update the certificate
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificateId },
      data: updatedData,
    });

    res.status(200).json({ success: true, data: updatedCertificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;
    const { userId } = req.user;

    // Check if the certificate exists and belongs to the user
    const certificateExists = await prisma.certificate.findFirst({
      where: { id: certificateId, userId },
    });

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or access denied",
      });
    }

    // Delete the certificate
    await prisma.certificate.delete({
      where: { id: certificateId },
    });

    res
      .status(200)
      .json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.insertEmploymentHistory = async (req, res) => {
  try {
    const { company, jobTitle, description, startedOn, endOn } = req.body;
    const { userId } = req.user; // Assuming userId comes from authentication middleware

    // Insert employment history into the database
    const result = await prisma.empolymentHistory.create({
      data: {
        company,
        jobTitle,
        description,
        startedOn: new Date(startedOn).toISOString(),
        endOn: new Date(endOn).toISOString(),
        userId, // Foreign key linking to the user
      },
    });

    // Send success response with the created employment history record
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error inserting employment history:", error.message);

    // Send error response if something goes wrong
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEmploymentHistory = async (req, res) => {
  try {
    const { employmentId } = req.body; // Assuming employmentId is passed in the body
    const { company, jobTitle, description, startedOn, endOn } = req.body;
    const { userId } = req.user; // Assuming userId comes from the authenticated user

    // Check if the employment history record exists
    const employmentRecord = await prisma.empolymentHistory.findUnique({
      where: { id: employmentId },
    });

    if (!employmentRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Employment history not found" });
    }

    // Update the employment history record
    const updatedEmployment = await prisma.empolymentHistory.update({
      where: { id: employmentId },
      data: {
        company: company || employmentRecord.company, // Update only if new value is provided
        jobTitle: jobTitle || employmentRecord.jobTitle,
        description: description || employmentRecord.description,
        startedOn: startedOn
          ? new Date(startedOn).toISOString()
          : employmentRecord.startedOn,
        endOn: endOn ? new Date(endOn).toISOString() : employmentRecord.endOn,
      },
    });

    // Send a success response with the updated employment record
    res.status(200).json({ success: true, data: updatedEmployment });
  } catch (error) {
    console.error("Error updating employment history:", error.message);

    // Send an error response if the update fails
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEmploymentHistory = async (req, res) => {
  try {
    const { employmentId } = req.body; // Assuming employmentId is passed in the request body
    const { userId } = req.user; // Assuming userId comes from the authenticated user

    // Check if the employment history record exists
    const employmentRecord = await prisma.empolymentHistory.findUnique({
      where: { id: employmentId },
    });

    if (!employmentRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Employment history not found" });
    }

    // Check if the user making the request is the owner of the employment history
    if (employmentRecord.userId !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // Delete the employment history record
    await prisma.empolymentHistory.delete({
      where: { id: employmentId },
    });

    // Send a success response after deletion
    res.status(200).json({
      success: true,
      message: "Employment history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employment history:", error.message);

    // Send an error response if the deletion fails
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller for adding a new location
exports.addLocation = async (req, res) => {
  const { city, state, country, postalCode } = req.body;
  const { userId } = req.user;

  try {
    // Check if a location already exists for this user
    const existingLocation = await prisma.location.findFirst({
      where: { userId },
    });

    let location;

    if (existingLocation) {
      // Update the existing location
      location = await prisma.location.update({
        where: { id: existingLocation.id }, // Use the unique 'id' field to update
        data: {
          city,
          state,
          country,
          postalCode,
        },
      });
    } else {
      // Create a new location
      location = await prisma.location.create({
        data: {
          userId,
          city,
          state,
          country,
          postalCode,
        },
      });
    }

    res.status(201).json({ success: true, message: location });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for deleting a location by ID
exports.deleteLocation = async (req, res) => {
  const { userId } = req.user; // Extract userId from the authenticated user

  try {
    // Check if the location exists for the given userId
    const location = await prisma.location.findFirst({
      where: { userId },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location for this user does not exist",
      });
    }

    // Proceed to delete the found location
    const deletedLocation = await prisma.location.delete({
      where: { id: location.id }, // Use the unique identifier of the found location
    });

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
      data: deletedLocation,
    });
  } catch (error) {
    console.error("Error during location deletion:", error.message); // Improved logging
    res.status(400).json({ success: false, error: error.message });
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

exports.uploadDocuments = async (req, res) => {
  try {
    const { websiteLink, additionalLink } = req.body;
    const { userId } = req.user;

    // Extract file paths for resume and portfolio (both are optional)
    const resumePath = req.files?.resume?.[0]?.filename || null;
    const portfolioPath = req.files?.portfolio?.[0]?.filename || null;

    // Check if a document record already exists for this user
    const existingDocument = await prisma.documents.findFirst({
      where: { userId },
    });

    let result;

    if (existingDocument) {
      console.log('data updated');
      // Update the existing document
      result = await prisma.documents.update({
        where: { id: existingDocument.id }, // Use the unique 'id' field to update
        data: {
          resumeLink: resumePath || existingDocument.resumeLink, // Optional update
          portfolioLink: portfolioPath || existingDocument.portfolioLink, // Optional update
          websiteLink: websiteLink || existingDocument.websiteLink, // Optional update
          additionalLink: additionalLink || existingDocument.additionalLink, // Optional update
        },
      });
    } else {
      console.log('data inserted');
      // Create a new document record
      result = await prisma.documents.create({
        data: {
          userId,
          resumeLink: resumePath, // Nullable, can be null
          portfolioLink: portfolioPath, // Nullable, can be null
          websiteLink: websiteLink || null, // Nullable, can be null
          additionalLink: additionalLink || null, // Nullable, can be null
        },
      });
    }

    // Respond with the result
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error during document upload:', error.message); // Improved logging
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId comes from a decoded JWT or session

    // Check if the document exists for the given userId
    const document = await prisma.documents.findFirst({
      where: { userId },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document for this user does not exist",
      });
    }

    // Now delete the found document using its unique ID
    const deletedDocument = await prisma.documents.delete({
      where: { id: document.id }, // Use the unique ID of the document
    });

    // Respond with the deletion success
    res.status(200).json({
      success: true,
      data: deletedDocument,
    });
  } catch (error) {
    console.log("Error during document deletion:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if the file is available
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    // Get the video filename
    const videoPath = req.file.filename;

    // Update the user's profile with the video link
    const updatedProfile = await prisma.profile.update({
      where: { userId: parseInt(userId) },
      data: {
        mentorvideolink: videoPath, // Store the relative video path in the database
      },
    });

    // Remove null values from the updatedProfile object
    const filteredProfile = Object.fromEntries(
      Object.entries(updatedProfile).filter(([_, v]) => v != null)
    );

    return res.status(200).json({
      message: "Video uploaded and profile updated successfully",
      profile: filteredProfile,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while uploading the video" });
  }
};

//////////////////////////////////////////////////////   NOT USED

///////////////////////////////////////////////////////////////////////////////

exports.post_about = async (req, res) => {
  const { about } = req.body;
  let { userId } = req.user;
  try {
    const newSession = await userViewModel.insert_about({
      userId,
      about,
    });
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.get_about = async (req, res) => {
  let { userId } = req.user;
  console.log(userId);
  try {
    const newSession = await userViewModel.get_about(userId);
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNotification = async (req, res) => {
  let { userId } = req.user;
  console.log(userId);
  try {
    const result = await userViewModel.getNotification(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReview = async (req, res) => {
  let { userId } = req.user;
  console.log(userId);
  try {
    const result = await userViewModel.getReview(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
