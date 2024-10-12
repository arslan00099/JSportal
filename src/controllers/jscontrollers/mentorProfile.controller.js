// src/controllers/notification.controller.js
const notificationViewModel = require('../../viewmodels/jsviewmodels/getmentorprofile.viewmodel');

// POST a new notification
exports.getMentorProfile = async (req, res) => {
  try {

    const result = await notificationViewModel.getAllMentors();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


