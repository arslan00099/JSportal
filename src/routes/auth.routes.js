const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // Import controller
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../utils/profilephotos/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use verified directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  }
});

// Multer upload configuration with file size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Routes
router.post('/signup', upload.single('profilePic'), authController.signup);
router.post('/login', authController.login);
router.post('/adminlogin', authController.adminlogin);
router.post('/forgetpassword', authController.forgotPassword);
router.post('/resetpassword', authController.resetPassword);

module.exports = router;
