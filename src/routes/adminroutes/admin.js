const express = require('express');
const router = express.Router();

//const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');
const timesheet = require('../../controllers/timesheetcontrollers/timesheet');


router.post('/job/approve',timesheet.updateAdminApprovalStatus);






module.exports = router;