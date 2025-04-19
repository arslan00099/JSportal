const express = require('express');
const router = express.Router();

// Correctly import the controller and middleware
const jobController = require('../../controllers/jscontrollers/job.controller');  // Ensure the path is correct
const middleware = require('../../middleware/auth.middleware');    // Ensure the path is correct

// Define routes
router.post('/post', middleware, jobController.postJob);
router.get('/post', middleware, jobController.getJob);
router.get('/jobDetials/:id', middleware, jobController.getJobDetails);
router.post('/apply', middleware, jobController.appliedjob);
router.post('/save', middleware, jobController.saveJobpost);
router.get('/type', middleware, jobController.getJobType);
router.get('/city', middleware, jobController.getCities);
router.get('/compnaynames', middleware, jobController.getCompanyNames);

module.exports = router;
