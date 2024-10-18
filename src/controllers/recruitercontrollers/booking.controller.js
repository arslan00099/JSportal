const viewmodel = require('../../viewmodels/mentorviewmodels/mentorsession.viewmodel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.postBooking = async (req, res) => {
  try {
    // Extracting data from req.body
    const { selectedService, selectedDateTime, recId } = req.body;

    if (!selectedService || !selectedDateTime || !recId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { userId } = req.user; // Ensure userId is coming from the request (if authenticated)

    // Create a new booking in the database
    const newBooking = await prisma.booking.create({
      data: {
        selectedService,
        selectedDateTime: new Date(selectedDateTime),
        employerId: userId, // Assumes the user is the employer
        recId: recId,       // Recruiter ID
        status: 'ACCEPTED',
        paymentStatus: 'PENDING'
      },
      // include: {
      //   Service: true, // Optionally include service details
      //   employer: true, // Include employer details
      //   recruiter: true // Include recruiter details
      // }
    });

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ success: false, message: 'Error creating booking' });
  }
};


exports.getMentorSession = async (req, res) => {
  try {
    let { userId } = req.user;
    let { startDate, endDate } = req.query;

    const result = await viewmodel.getBookedMentorSessions(userId, startDate, endDate);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getMentorEarnings = async (req, res) => {
  try {
    let { userId } = req.user;
    let { startDate, endDate } = req.query;// Extract path parameters
    console.log(startDate); // Logs the start date
    console.log(endDate);

    const result = await viewmodel.getBookedMentorEarnings(userId, startDate, endDate);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

