const express = require('express');
const router = express.Router();

const allrecruiter = require('../../controllers/employercontrollers/fetchallrecruiter');

router.get('/getallrecruiter', allrecruiter.getallRecruiterProfile);

module.exports = router;