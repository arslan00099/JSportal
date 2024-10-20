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


exports.fetchBooking = async (req, res) => {
  try {
    const { userId } = req.user; // Get the authenticated user's ID

    // Fetch bookings where recId matches the user's ID
    const bookings = await prisma.booking.findMany({
      where: {
        recId: userId, // Fetch bookings for this recruiter (recId matches userId)
      },
      include: {
        Service: {
          select: {
            name: true, // Optionally fetch the service name
          },
        },
        employer: {
          select: {
            email: true, // Optionally fetch the employer's email
          },
        },
      },
    });

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: 'No bookings found for this recruiter' });
    }

    // Return the fetched bookings
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
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

