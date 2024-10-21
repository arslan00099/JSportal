const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// const controller = require('../../controllers/mentorcontrollers/mentorProfile.controller');
// const booking=require('../../controllers/mentorcontrollers/session.controller');
// const notificationController = require('../../controllers/mentorcontrollers/notification.controller');
const profileController=require ('../../controllers/recruitercontrollers/profile.controller');
const middleware = require('../../middleware/middleware');
const settingController = require('../../controllers/recruitercontrollers/setting.controller');
const serviceController = require('../../controllers/recruitercontrollers/service.controller');
const bookingController = require ('../../controllers/recruitercontrollers/booking.controller');


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

// router.post('/testprofile', middleware,controller.insert);
// router.get('/testprofile', controller.getMentorProfile);
// router.get('/session',middleware,booking.getMentorSession);
// router.get('/earnings',middleware,booking.getMentorEarnings);

//NOTIFICATIONS
// router.get('/', middleware, notificationController.getNotifications);
// router.post('/', middleware, notificationController.createNotification);

//PROFILE 
// Apply the multer middleware
router.post('/profile', middleware, upload.single('profilePic'), profileController.postProfile);
router.delete('/profile', middleware, profileController.deleteProfile)
router.get('/profile', middleware, profileController.getProfile);

router.post('/education', middleware, profileController.postEducation);
router.put('/education', middleware, profileController.updateEducation);
router.delete('/education', middleware, profileController.deleteEducation);

router.post('/certificate', middleware, profileController.insertCertificate);
router.put('/certificate', middleware, profileController.updateCertificate);
router.delete('/certificate', middleware, profileController.deleteCertificate);

router.post('/employment-history', middleware, profileController.insertEmploymentHistory);
router.put('/employment-history', middleware, profileController.updateEmploymentHistory);
router.delete('/employment-history', middleware, profileController.deleteEmploymentHistory);

router.post('/location', middleware, profileController.addLocation);
router.delete('/location', middleware, profileController.deleteLocation);

router.post("/booking", middleware, bookingController.postBooking);
router.get("/booking", middleware, bookingController.fetchBooking);




router.delete('/documents', middleware, profileController.deleteDocuments);
router.post('/documents', middleware, cvupload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]), profileController.uploadDocuments);


// router.post("/about",middleware,userController.post_about);
// router.get("/about",middleware,userController.get_about);
// router.get("/notification",middleware, userController.getNotification);
// router.get("/review",middleware, userController.getReview);

router.put('/change-email', middleware, settingController.changeEmail);
router.put('/change-password', middleware, settingController.changePassword);
router.put('/deactivate', middleware, settingController.deactivateUser);
router.delete('/delete', middleware, settingController.deleteUser);


// // Route to add a new service
router.post('/service', serviceController.addService);
router.put('/service', serviceController.updateService);
router.delete('/service', serviceController.deleteService);


router.post('/upload-video', uploadVideo.single('mentorVideo'),middleware, profileController.uploadVideo);


module.exports = router;