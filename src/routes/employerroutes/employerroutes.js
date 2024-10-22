const express = require('express');
const router = express.Router();

const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');
const timesheet = require('../../controllers/timesheetcontrollers/timesheet');

router.get('/getallrecruiter', allrecruiter.getallRecruiterProfile);
router.post('/postjob',timesheet.postJob);
router.post('/approveTimesheet',timesheet.approveTimesheet)






module.exports = router;