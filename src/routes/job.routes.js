const express = require('express');
const router = express.Router();

// Correctly import the controller and middleware
const jobController = require('../controllers/job.controller');  // Ensure the path is correct
const middleware = require('../middleware/auth.middleware');    // Ensure the path is correct

// Define routes
router.post('/post',  jobController.postJob);
router.get('/post',middleware, jobController.getJob);
router.post('/apply',middleware,jobController.appliedjob);
router.post('/save',middleware, jobController.saveJobpost);

module.exports = router;
