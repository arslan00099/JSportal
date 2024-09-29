const express = require('express');
const router = express.Router();
const controller = require('../controllers/mentorProfile.controller');
const middleware = require('../middleware/middleware');


router.post('/profile', middleware,controller.insert);
router.get('/profile', controller.getMentorProfile);


module.exports = router;
