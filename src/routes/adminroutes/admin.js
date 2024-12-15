const express = require('express');
const router = express.Router();

//const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');
const timesheet = require('../../controllers/timesheetcontrollers/timesheet');
const mentorProfile=require('../../controllers/admincontrollers/mentors');
const dashboard=require('../../controllers/admincontrollers/dashboard');


router.post('/job/approve',timesheet.updateAdminApprovalStatus);

router.get('/mentorProfile',mentorProfile.getAllMentorsWithServices);
router.get('/dashboard',dashboard.getDashboard);
router.get('/getallMentors',dashboard.getAllMentors);
router.get('/getallJS',dashboard.getAllJS);
router.get('/mentorProfile/:userId',mentorProfile.getMentorByid);
router.get('/getMentorBookings/:userId',dashboard.getAllMentorBookings);
//router.get('/getJSBookings/:userId',dashboard.getAllJSBookings);
router.get('/getMentorReviews/:userId',dashboard.getMentorReviews);
//router.get('/getJSReviews/:userId',dashboard.getJSReviews);
router.get('/getAllEmployers',dashboard.getAllEmployers);
router.get('/getEmployerBookings/:userId',dashboard.getEmployerBookings);
router.get('/getallRec',dashboard.getAllRec);
router.get('/recProfile/:userId',dashboard.getRecByid);
router.get('/recBooking/:userId',dashboard.getRecBookings);






module.exports = router;