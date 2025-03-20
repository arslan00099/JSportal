const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const controller = require('../../controllers/mentorcontrollers/mentorProfile.controller');
const booking=require('../../controllers/mentorcontrollers/session.controller');
const notificationController = require('../../controllers/mentorcontrollers/notification.controller');
const userController=require ('../../controllers/mentorcontrollers/user.controller');
const middleware = require('../../middleware/middleware');
const settingController = require('../../controllers/mentorcontrollers/setting.controller');
const serviceController = require('../../controllers/mentorcontrollers/service.controller');
const dashboard=require('../../controllers/mentorcontrollers/dashboard');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../utils/profilephotos')); // Adjust the path as needed
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const cvstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../utils/resume')); // Adjust the path as needed
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const videostorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../utils/video')); // Path for storing videos
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`; // Create a unique name
    cb(null, uniqueName);
  },
});



const upload = multer({ storage: storage });
const cvupload = multer({ storage: cvstorage });
const uploadVideo = multer({ storage: videostorage });

router.post('/testprofile', middleware,controller.insert);
router.get('/testprofile', controller.getMentorProfile);
router.get('/session',middleware,booking.getMentorSession);
router.get('/earnings',middleware,booking.getMentorEarnings);

//NOTIFICATIONS
router.get('/', middleware, notificationController.getNotifications);
router.post('/', middleware, notificationController.createNotification);

//PROFILE 
// Apply the multer middleware
router.post('/profile', middleware, upload.single('profilePic'), userController.postProfile);
router.delete('/profile', middleware, userController.deleteProfile)
router.get('/profile', middleware, userController.getProfile);

router.post('/education', middleware, userController.postEducation);
router.put('/education', middleware, userController.updateEducation);
router.delete('/education', middleware, userController.deleteEducation);

router.post('/certificate', middleware, userController.insertCertificate);
router.put('/certificate', middleware, userController.updateCertificate);
router.delete('/certificate', middleware, userController.deleteCertificate);

router.post('/employment-history', middleware, userController.insertEmploymentHistory);
router.put('/employment-history', middleware, userController.updateEmploymentHistory);
router.get('/employment-history', middleware, userController.getEmploymentHistory);
router.delete('/employment-history', middleware, userController.deleteEmploymentHistory);

router.post('/location', middleware, userController.addLocation);
router.get('/location', middleware, userController.getLocations);
router.delete('/location', middleware, userController.deleteLocation);

router.post("/book-session", middleware, userController.createMentorSession);
router.get("/book-session", middleware, userController.fetchMentorSession);




router.delete('/documents', middleware, userController.deleteDocuments);
router.post('/documents', middleware, cvupload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]), userController.uploadDocuments);


router.post("/about",middleware,userController.post_about);
router.get("/about",middleware,userController.get_about);
router.get("/notification",middleware, userController.getNotification);
router.get("/review",middleware, userController.getReview);

router.put('/change-email', middleware, settingController.changeEmail);
router.put('/change-password', middleware, settingController.changePassword);
router.put('/deactivate', middleware, settingController.deactivateUser);
router.delete('/delete', middleware, settingController.deleteUser);


// Route to add a new service
router.post('/service', serviceController.addService);
router.put('/service', serviceController.updateService);
router.delete('/service', serviceController.deleteService);


router.post('/upload-video', uploadVideo.single('mentorVideo'),middleware, userController.uploadVideo);

//dashbord
router.get('/getMentorStatsCount/:mentorId',dashboard.getMentorStats);
router.get('/UpcomingSessions/:mentorId',dashboard.getUpcomingSessions);
router.get('/getMentorReviews/:mentorId',dashboard.getMentorReviews);
router.get('/getMentorEarnings/:mentorId',dashboard.getMentorEarnings);
router.post('/linkCalendly/:Id',dashboard.linkCalendly);


module.exports = router;
