const express = require('express');
const router = express.Router();

const mentorController = require('../../controllers/jscontrollers/mentorProfile.controller');

router.get('/', mentorController.getMentorProfile);
router.get('/:id', mentorController.getMentorProfileById);

module.exports = router;
