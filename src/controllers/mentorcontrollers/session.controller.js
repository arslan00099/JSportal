const viewmodel = require('../../viewmodels/mentorviewmodels/mentorsession.viewmodel');



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

