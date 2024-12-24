const express = require('express');
const router = express.Router();

//const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');
const timesheet = require('../../controllers/timesheetcontrollers/timesheet');
const mentorProfile = require('../../controllers/admincontrollers/mentors');
const dashboard = require('../../controllers/admincontrollers/dashboard');


router.post('/job/approve', timesheet.updateAdminApprovalStatus);

router.get('/mentorProfile', mentorProfile.getAllMentorsWithServices);
router.get('/dashboard', dashboard.getDashboard);
router.get('/getallMentors', dashboard.getAllMentors);
router.get('/getallJS', dashboard.getAllJS);
router.get('/mentorProfile/:userId', mentorProfile.getMentorByid);
router.get('/getMentorBookings/:userId', dashboard.getAllMentorBookings);
router.put('/updateMentorSession/:bookingId', dashboard.updateMentorBookingStatus);
//router.get('/getJSBookings/:userId',dashboard.getAllJSBookings);
//router.get('/getJSReviews/:userId',dashboard.getJSReviews);
router.get('/getMentorReviews/:userId', dashboard.getMentorReviews);
router.get('/getAllEmployers', dashboard.getAllEmployers);
router.get('/getEmployerBookings/:userId', dashboard.getEmployerBookings);
router.put('/updateEmployerBookingStatus/:bookingId', dashboard.updateEmployerBookingStatus);
router.get('/getallRec', dashboard.getAllRec);
router.get('/recProfile/:userId', dashboard.getRecByid);
router.get('/recBooking/:userId', dashboard.getRecBookings);
router.delete('/deleteAccount/:userId', dashboard.deleteUserAndProfile);

router.post('/addIndustry', (req, res) => dashboard.createEntry({ ...req, params: { model: 'industry' } }, res));
router.put('/updateIndustry', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'industry' } }, res));
router.delete('/deleteIndustry', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'industry' } }, res));
router.get('/getIndustries', (req, res) => dashboard.getEntries({ ...req, params: { model: 'industry' } }, res));
// router.get('/getIndustries/:search', (req, res) => {
//     const { search } = req.params; // Extract search from params
//     const modifiedReq = { ...req, params: { ...req.params, model: 'industry', search } }; // Add model and search
//     dashboard.getEntries(modifiedReq, res); // Call your handler
//   });


// // MentorService
router.post('/addMentorService', (req, res) => dashboard.createEntry({ ...req, params: { model: 'mentorService' } }, res));
router.put('/updateMentorService', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'mentorService' } }, res));
router.delete('/deleteMentorService', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'mentorService' } }, res));
router.get('/getMentorServices', (req, res) => {dashboard.getEntries({ ...req, params: { ...req.params, model: 'mentorService' } }, res);});

// // RecService
router.post('/addRecService', (req, res) => dashboard.createEntry({ ...req, params: { model: 'recService' } }, res));
router.put('/updateRecService', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'recService' } }, res));
router.delete('/deleteRecService', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'recService' } }, res));
router.get('/getRecServices/:search?', (req, res) => {
    dashboard.getEntries({ ...req, params: { ...req.params, model: 'recService' } }, res);
});

// // Language
router.post('/addLanguage', (req, res) => dashboard.createEntry({ ...req, params: { model: 'language' } }, res));
router.put('/updateLanguage', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'language' } }, res));
router.delete('/deleteLanguage', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'language' } }, res));
router.get('/getLanguages', (req, res) => {dashboard.getEntries({ ...req, params: { ...req.params, model: 'language' } }, res);});
// // Skill
router.post('/addSkill', (req, res) => dashboard.createEntry({ ...req, params: { model: 'skill' } }, res));
router.put('/updateSkil', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'skill' } }, res));
router.delete('/deleteSkill', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'skill' } }, res));
router.get('/getSkills',(req, res) => {dashboard.getEntries({ ...req, params: { ...req.params, model: 'skill' } }, res);});

//  // Profile Approvals
router.get('/mentorApproval/:role', dashboard.mentorApproval);
router.put('/updateUserStatus', dashboard.updateUserStatus);
router.get('/getRecDetail/:userId', dashboard.getRecMenDetails);


router.get('/getRecruiterHiring', dashboard.getRecruiterHiring);
router.put('/updateInvoice/:id', dashboard.updateInvoice);
router.put('/updateInvoice/:id', dashboard.updateInvoice);
router.get('/getRecruiterHiringDetail/:bookingId',dashboard.getRecruiterHiringDetail);
router.get('/getPaymentDetails',dashboard.getPaymentDetails);
router.get('/getPaymentDetails:/role',dashboard.getPaymentDetailrole);


router.post('/AdminSettings',dashboard.upsertAdminSettings);
router.post('/postPages',dashboard.postPages);
router.post('/postSelection',dashboard.postSection);
router.post('/postContents',dashboard.postContents);

router.get('/getProfile/:id',dashboard.getProfile);
router.put('/manageUser/:id',dashboard.manageUser);

router.get('/getBlogs',dashboard.getBlog);
router.put('/blogStatus/:id', dashboard.updateBlogStatus);








module.exports = router;