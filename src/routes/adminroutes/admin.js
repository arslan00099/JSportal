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
router.delete('/deleteAccount/:userId',dashboard.deleteUserAndProfile);

router.post('/addIndustry', (req, res) => dashboard.createEntry({ ...req, params: { model: 'industry' } }, res));
 router.put('/updateIndustry/:id', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'industry' } }, res));
 router.delete('/deleteIndustry/:id', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'industry' } }, res));
router.get('/getIndustries', (req, res) => dashboard.getEntries({ ...req, params: { model: 'industry' } }, res));

// // MentorService
router.post('/addMentorService', (req, res) => dashboard.createEntry({ ...req, params: { model: 'mentorService' } }, res));
router.put('/updateMentorService/:id', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'mentorService' } }, res));
router.delete('/deleteMentorService/:id', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'mentorService' } }, res));
router.get('/getMentorServices', (req, res) => dashboard.getEntries({ ...req, params: { model: 'mentorService' } }, res));

// // RecService
router.post('/addRecService', (req, res) => dashboard.createEntry({ ...req, params: { model: 'recService' } }, res));
router.put('/updateRecService/:id', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'recService' } }, res));
router.delete('/deleteRecService/:id', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'recService' } }, res));
router.get('/getRecServices', (req, res) => dashboard.getEntries({ ...req, params: { model: 'recService' } }, res));

// // Language
router.post('/addLanguage', (req, res) => dashboard.createEntry({ ...req, params: { model: 'language' } }, res));
router.put('/updateLanguage/:id', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'language' } }, res));
router.delete('/deleteLanguage/:id', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'language' } }, res));
router.get('/getLanguages', (req, res) => dashboard.getEntries({ ...req, params: { model: 'language' } }, res));

// // Skill
router.post('/addSkill', (req, res) => dashboard.createEntry({ ...req, params: { model: 'skill' } }, res));
router.put('/updateSkill/:id', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'skill' } }, res));
router.delete('/deleteSkill/:id', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'skill' } }, res));
router.get('/getSkills', (req, res) => dashboard.getEntries({ ...req, params: { model: 'skill' } }, res));






module.exports = router;