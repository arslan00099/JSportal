// src/routes/user.routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../../controllers/jscontrollers/user.controller');
const middleware = require('../../middleware/middleware');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../utils/profilephotos')); // Adjust the path as needed
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const cvstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../utils/resume')); // Adjust the path as needed
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });
const cvupload = multer({ storage: cvstorage });

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



module.exports = router;
