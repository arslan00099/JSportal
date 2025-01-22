// src/viewmodels/profile.viewmodel.js
const { PrismaClient } = require("@prisma/client");
const {
  deleteDocument,
} = require("../../controllers/jscontrollers/user.controller");
const prisma = new PrismaClient();

class UserProfileViewModel {
  async basicprofile(userId, fullname, phnumber, avatarId) {
    const avatarBaseUrl = "http://54.144.76.160:5000/utils/profilephotos"; // Your actual URL

    const userExists = await prisma.profile.findUnique({ where: { userId } });

    let updateData = {
      fullname,
      phnumber:String(phnumber),
    };

    // Only add avatarId to updateData if a new file is uploaded
    if (avatarId) {
      updateData.avatarId = avatarId;
    }

    let userProfile;
    if (userExists) {
      // Update the existing user profile
      userProfile = await prisma.profile.update({
        where: { userId },
        data: updateData, // Conditionally update avatarId if necessary
      });
    } else {
      // Create a new profile if the user doesn't exist
      userProfile = await prisma.profile.create({
        data: {
          userId,
          fullname,
          phnumber:String(phnumber),
          avatarId, // Save avatarId when creating a new profile
        },
      });
    }

    // If the avatarId exists in the profile, append the base URL to it
    if (userProfile.avatarId) {
      userProfile.avatarId = `${avatarBaseUrl}/${userProfile.avatarId}`;
    }

    return userProfile;
  }

  async getProfile(userId) {
    try {
      const userDetails = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Profile: {
            include: {
              JobSeekerProfile: true, // Fetch Job Seeker Profile details
              //     MentorProfile: true,     // Fetch Mentor Profile details
              //   RecruiterProfile: true,  // Fetch Recruiter Profile details
              //   EmployerProfile: true,   // Fetch Employer Profile details
              //   AdminProfile: true       // Fetch Admin Profile details
            },
          },
          Education: true, // Fetch all Education details
          Certificate: true, // Fetch all Certificate details
          Location: true, // Fetch all Location details
          EmpolymentHistory: true, // Fetch all Employment History
          Documents: true, // Fetch all Documents details
        },
      });

      // If no user found, return null or handle as needed
      if (!userDetails) {
        throw new Error("User not found");
      }

      // Base URLs for avatar and documents
      const avatarBaseUrl = "http://54.144.76.160:5000/utils/profilephotos"; // Replace with your actual URL
      const resumeBaseUrl = "http://54.144.76.160:5000/utils/resume"; // Replace with your actual URL

      // Add full URL for avatar
      userDetails.Profile.forEach((profile) => {
        if (profile.avatarId) {
          profile.avatarId = `/utils/profilephotos/${profile.avatarId}`;
          profile.avatarUrl = `${avatarBaseUrl}/${profile.avatarId}`;
        }
      });

      // Add full URL for resume and portfolio documents
      userDetails.Documents.forEach((document) => {
        if (document.resumeLink) {
          document.resumeUrl = `${resumeBaseUrl}/${document.resumeLink}`;
        }
        if (document.portfolioLink) {
          document.portfolioUrl = `${resumeBaseUrl}/${document.portfolioLink}`;
        }
      });

      // Remove password field
      delete userDetails.password;

      return userDetails;
    } catch (error) {
      throw new Error("Error fetching user details: " + error.message);
    }
  }

  async deleteProfile(userId) {
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      throw new Error("Profile not found");
    }

    // Perform the deletion
    const deletedProfile = await prisma.profile.delete({
      where: { userId },
    });

    return deletedProfile;
  }

  async insertEducation(degree, institution, description, from, to, userId) {
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();
    console.log(fromDate);
    console.log(toDate);
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

    await prisma.user.update({
      where: { id: userId },
      data: { firstLogin: false },
    });
    return newEducation;
  }

  async updateEducation(
    educationId,
    degree,
    institution,
    description,
    from,
    to
  ) {
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();

    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: {
        degreName: degree,
        universityName: institution,
        description,
        startFrom: fromDate,
        endIn: toDate,
      },
    });

    return updatedEducation;
  }

  async deleteEducation(userId, educationId) {
    const userProfile = await prisma.education.findFirst({
      where: {
        userId: userId,
        id: educationId,
      },
    });

    if (!userProfile) {
      throw new Error("Education for this user does not exist");
    }

    const deletedProfile = await prisma.education.delete({
      where: { id: educationId },
    });

    return deletedProfile;
  }

  async insertCertificate(certName, orgName, description, from, to, userId) {
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();

    // Insert a new certificate for the user
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

    return newCertificate;
  }

  async updateCertificate(
    certificateId,
    certName,
    orgName,
    description,
    from,
    to
  ) {
    const fromDate = new Date(from).toISOString();
    const toDate = new Date(to).toISOString();

    // Update the certificate by its unique id
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificateId }, // Use certificateId to update the correct certificate
      data: {
        certName: certName,
        orgName: orgName,
        description: description, // Update description if provided
        startedOn: fromDate,
        completedOn: toDate,
      },
    });

    return updatedCertificate;
  }

  async deleteCertificate(userId, certificateId) {
    // Check if a certificate exists for the user
    const certificate = await prisma.certificate.findFirst({
      where: {
        userId,
        id: certificateId,
      },
    });

    if (!certificate) {
      throw new Error("Certificate for this user does not exist");
    }

    // Perform the deletion
    const deletedCertificate = await prisma.certificate.delete({
      where: { id: certificateId },
    });

    return deletedCertificate;
  }

  async addLocation(userId, city, state, country, postalCode) {
    try {
      // Check if a location already exists for this user
      const existingLocation = await prisma.location.findFirst({
        where: { userId },
      });

      if (existingLocation) {
        // Update the existing location
        const updatedLocation = await prisma.location.update({
          where: { id: existingLocation.id }, // Use the unique 'id' field to update
          data: {
            city,
            state,
            country,
            postalCode,
          },
        });
        return updatedLocation;
      } else {
        // Create a new location
        const newLocation = await prisma.location.create({
          data: {
            userId,
            city,
            state,
            country,
            postalCode,
          },
        });
        return newLocation;
      }
    } catch (error) {
      throw new Error("Error adding or updating location: " + error.message);
    }
  }

  // ViewModel for deleting a location by ID
  async deleteLocation(userId) {
    try {
      // Check if the location exists for the given userId
      const location = await prisma.location.findFirst({
        where: { userId },
      });

      if (!location) {
        throw new Error("Location for this user does not exist");
      }

      // Proceed to delete the found location
      const deletedLocation = await prisma.location.delete({
        where: { id: location.id }, // Use the unique identifier of the found location
      });

      return deletedLocation;
    } catch (error) {
      throw new Error("Error deleting location: " + error.message);
    }
  }

  // ViewModel for getting locations by userId
  async getLocations(userId) {
    try {
      const locations = await prisma.location.findMany({
        where: { userId },
      });
      return locations;
    } catch (error) {
      throw new Error("Error retrieving locations: " + error.message);
    }
  }

  async InsertDocuments(
    userId,
    resumePath,
    portfolioPath,
    websiteLink,
    additionalLink
  ) {
    try {
      // Check if a document record already exists for this user
      const existingDocument = await prisma.documents.findFirst({
        where: { userId },
      });

      if (existingDocument) {
        console.log("data updated");
        // Update the existing document
        const updatedDocument = await prisma.documents.update({
          where: { id: existingDocument.id }, // Use the unique 'id' field to update
          data: {
            resumeLink: resumePath,
            portfolioLink: portfolioPath,
            websiteLink: websiteLink || existingDocument.websiteLink, // Optional update
            additionalLink: additionalLink || existingDocument.additionLink, // Optional update
          },
        });
        return updatedDocument;
      } else {
        console.log("data inserted");
        // Create a new document record
        const newDocument = await prisma.documents.create({
          data: {
            userId,
            resumeLink: resumePath,
            portfolioLink: portfolioPath,
            websiteLink, // Nullable, can be undefined
            additionalLink, // Nullable, can be undefined
          },
        });
        return newDocument;
      }
    } catch (error) {
      throw new Error(
        "Error inserting or updating documents: " + error.message
      );
    }
  }

  async insertEmploymentHistory(
    company,
    jobTitle,
    description,
    startedOn,
    endOn,
    userId
  ) {
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

    return result;
  }

  async updateEmploymentHistory(
    employmentId,
    company,
    jobTitle,
    description,
    startedOn,
    endOn
  ) {
    const result = await prisma.empolymentHistory.update({
      where: { id: employmentId }, // Identify the record by its unique id
      data: {
        company,
        jobTitle,
        description,
        startedOn: new Date(startedOn).toISOString(),
        endOn: new Date(endOn).toISOString(),
      },
    });

    return result;
  }

  async deleteEmploymentHistory(userId, employmentId) {
    // Check if the employment history exists for the given userId
    const employmentHistory = await prisma.EmpolymentHistory.findFirst({
      where: {
        userId: userId,
        id: employmentId,
      },
    });

    if (!employmentHistory) {
      throw new Error("Employment history for this user does not exist");
    }

    // Now delete the found record
    const deletedEmploymentHistory = await prisma.EmpolymentHistory.delete({
      where: { id: employmentId },
    });

    return deletedEmploymentHistory;
  }

  async getEmploymentHistory(userId) {
    const result = await prisma.employmentHistory.findUnique({
      where: { userId },
    });
    return result;
  }

  async deleteDocument(userId) {
    // Check if the document exists for the given userId
    const document = await prisma.documents.findFirst({
      where: { userId },
    });

    if (!document) {
      throw new Error("Document for this user does not exist");
    }

    // Now delete the found document using its unique ID
    const deletedDocument = await prisma.documents.delete({
      where: { id: document.id }, // Use the unique ID of the document
    });

    return deletedDocument;
  }

  async createMentorSession({
    selectedService,
    selectedDateTime,
    userId,
    mentorId,
  }) {
    console.log(selectedService, selectedDateTime, userId, mentorId);
    try {
      const mentorSession = await prisma.mentorSessionManagement.create({
        data: {
          selectedService, // This is the service ID
          selectedDateTime: new Date(selectedDateTime), // Ensure the date format is correct
          userId,
          mentorProfileId: mentorId, // Linking mentorId with mentorProfileId
          status: "ACCEPTED", // Default session status
          paymentStatus: "COMPLETED", // Set initial payment status
        },
        include: {
          Service: true, // Include the Service details in the response
          user: true, // Include the user (JobSeeker) details
          mentor: true, // Include the mentor details (use mentor, not MentorProfile)
        },
      });

      return mentorSession;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getBookedMentorSessions(userId) {
    try {
      const sessions = await prisma.mentorSessionManagement.findMany({
        where: {
          userId: userId, // Filter by userId
        },
        include: {
          Service: {
            select: {
              name: true, // Only select service name
            },
          },
          mentor: {
            select: {
              Profile: {
                select: {
                  fullname: true,
                },
              },
            },
          },
        },
      });

      // Return only the required fields in list format
      const filteredSessions = sessions.map((session) => ({
        mentorName: session.mentor?.Profile[0].fullname || "N/A",
        serviceName: session.Service?.name || "N/A",
        selectedDateTime: session.selectedDateTime,
      }));

      return filteredSessions;
    } catch (error) {
      console.error("Error fetching mentor sessions:", error);
      throw error;
    }
  }
}
module.exports = new UserProfileViewModel();
