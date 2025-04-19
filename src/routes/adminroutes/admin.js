const express = require('express');
const router = express.Router();

//const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');
const timesheet = require('../../controllers/timesheetcontrollers/timesheet');
const mentorProfile = require('../../controllers/admincontrollers/mentors');
const dashboard = require('../../controllers/admincontrollers/dashboard');
const middleware=require('../../middleware/middleware');


router.post('/job/approve',middleware, timesheet.updateAdminApprovalStatus);

router.get('/mentorProfile', middleware, mentorProfile.getAllMentorsWithServices);
router.get('/dashboard', middleware, dashboard.getDashboard);
router.get('/getallMentors', middleware, dashboard.getAllMentors);
router.get('/getallJS', middleware, dashboard.getAllJS);
router.get('/getallFS', middleware, dashboard.getAllSF);
router.put('/SFstatus/:userId',middleware, dashboard.updateStaffStatus);
router.get('/mentorProfile/:userId', middleware, mentorProfile.getMentorByid);
router.get('/getMentorBookings/:userId', middleware, dashboard.getAllMentorBookings);
router.put('/updateMentorSession/:bookingId', middleware, dashboard.updateMentorBookingStatus);
//router.get('/getJSBookings/:userId',dashboard.getAllJSBookings);
//router.get('/getJSReviews/:userId',dashboard.getJSReviews);
router.get('/getMentorReviews/:userId', middleware, dashboard.getMentorReviews);
router.get('/getAllEmployers', middleware, dashboard.getAllEmployers);
router.get('/getEmployerBookings/:userId', middleware, dashboard.getEmployerBookings);
router.put('/updateEmployerBookingStatus/:bookingId', middleware, dashboard.updateEmployerBookingStatus);
router.get('/getallRec',middleware, dashboard.getAllRec);
router.get('/recProfile/:userId', middleware, dashboard.getRecByid);
router.get('/recBooking/:userId', middleware, dashboard.getRecBookings);
router.delete('/deleteAccount/:userId', middleware, dashboard.deleteUserAndProfile);

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
router.get('/getMentorServices', (req, res) => { dashboard.getEntries({ ...req, params: { ...req.params, model: 'mentorService' } }, res); });

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
router.get('/getLanguages', (req, res) => { dashboard.getEntries({ ...req, params: { ...req.params, model: 'language' } }, res); });
// // Skill
router.post('/addSkill', (req, res) => dashboard.createEntry({ ...req, params: { model: 'skill' } }, res));
router.put('/updateSkil', (req, res) => dashboard.updateEntry({ ...req, params: { model: 'skill' } }, res));
router.delete('/deleteSkill', (req, res) => dashboard.deleteEntry({ ...req, params: { model: 'skill' } }, res));
router.get('/getSkills', (req, res) => { dashboard.getEntries({ ...req, params: { ...req.params, model: 'skill' } }, res); });

//  // Profile Approvals
router.get('/mentorApproval/:role', middleware, dashboard.mentorApproval);
router.put('/updateUserStatus',middleware,  dashboard.updateUserStatus);
router.get('/getRecDetail/:userId', middleware, dashboard.getRecMenDetails);


router.get('/getRecruiterHiring',middleware,  dashboard.getRecruiterHiring);
router.put('/updateInvoice/:id', middleware, dashboard.updateInvoice);
router.put('/updateInvoice/:id',middleware, dashboard.updateInvoice);
router.get('/getRecruiterHiringDetail/:bookingId', middleware, dashboard.getRecruiterHiringDetail);
router.get('/getPaymentDetails', middleware,dashboard.getPaymentDetails);
router.get('/getPlainDetail/:id', middleware,dashboard.getEmployerPlainDetial);
router.get('/getPaymentDetails:/role',middleware, dashboard.getPaymentDetailrole);


router.post('/AdminSettings', middleware,dashboard.upsertAdminSettings);
router.get('/AdminSettings',middleware, dashboard.getAdminSettings);
router.post('/postPages', middleware,dashboard.postPages);
router.post('/postSelection', middleware,dashboard.postSection);
router.post('/postContents', middleware, dashboard.postContents);

router.get('/getProfile/:id', middleware, dashboard.getProfile);
router.put('/manageUser/:id', middleware, dashboard.manageUser);

router.get('/getBlogs', middleware, dashboard.getBlog);
router.put('/blogStatus/:id', middleware, dashboard.updateBlogStatus);
router.get('/blogs/:id',middleware,  dashboard.getBlogById);
router.put('/blogs/:id', middleware, dashboard.updateBlogContent);

router.get('/timesheetCounts', middleware,dashboard.getCountsTimesheet);
router.get('/timesheetDetails',middleware,  dashboard.getTimesheetDetails);
router.put('/paymentstatus/:timesheetId', middleware, dashboard.updatePaymentStatus);
router.put('/adminapprovalstatus/:timesheetId', middleware, dashboard.updateAdminApprovalStatus);
router.post('/addInvoice/:timesheetId', middleware, dashboard.addInvoice);
router.get('/adminNotification',middleware,  dashboard.getNotification);
router.get('/getTimesheetById/:id', middleware, dashboard.getTimesheetById);

router.get('/jsbyid/:id', middleware, dashboard.getJobSeekerById);
router.get('/employerslist',middleware, dashboard.getAllEmployerslist);
router.get('/userwithcompany/:id',middleware, dashboard.getCompnaywithUser);









module.exports = router;