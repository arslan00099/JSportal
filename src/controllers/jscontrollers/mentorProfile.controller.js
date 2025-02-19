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

exports.getMentorProfileById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const result = await notificationViewModel.getMentorById(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


