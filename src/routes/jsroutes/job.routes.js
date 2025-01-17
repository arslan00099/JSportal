const express = require('express');
const router = express.Router();

// Correctly import the controller and middleware
const jobController = require('../../controllers/jscontrollers/job.controller');  // Ensure the path is correct
const middleware = require('../../middleware/auth.middleware');    // Ensure the path is correct

// Define routes
router.post('/post', jobController.postJob);
router.get('/post', jobController.getJob);
router.get('/jobDetials/:id', jobController.getJobDetails);
router.post('/apply', jobController.appliedjob);
router.post('/save', jobController.saveJobpost);
router.get('/type', jobController.getJobType);
router.get('/city', jobController.getCities);
router.get('/compnaynames', jobController.getCompanyNames);

module.exports = router;
