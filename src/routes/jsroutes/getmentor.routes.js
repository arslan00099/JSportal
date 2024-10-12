const express = require('express');
const router = express.Router();

const mentorController = require('../../controllers/jscontrollers/mentorProfile.controller');

router.get('/', mentorController.getMentorProfile);

module.exports = router;
