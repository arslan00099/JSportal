// src/controllers/user.controller.js
const jobviewmodel = require('../../viewmodels/jsviewmodels/job.viewmodel');

// POST a new job
exports.postJob = async (req, res) => {
  try {
    const { jobTitle, companyName, location, description, applicationLink, companyIcon, status, time, salary, jobType } = req.body;
    console.log(time);
    console.log(salary);
    const result = await jobviewmodel.postJob(jobTitle, companyName, location, description, applicationLink, companyIcon, status, time, salary, jobType);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getJob = async (req, res) => {
  try {
    // Destructure query parameters from the request
    let { jobTitle, companyName, location, jobType, pay, dateRange } = req.query;
    let { userId } = req.user;
    // Normalize the string fields (convert to lowercase)
    jobTitle = jobTitle ? jobTitle.toLowerCase() : '';
    companyName = companyName ? companyName.toLowerCase() : '';
    location = location ? location.toLowerCase() : '';
    jobType = jobType ? jobType.toLowerCase() : '';
    pay = pay ? pay.toLowerCase() : '';

    // Split dateRange (if provided) to get start and end dates
    let startDate, endDate;
    if (dateRange) {
      const dates = dateRange.split(',');
      startDate = new Date(dates[0]);
      endDate = dates[1] ? new Date(dates[1]) : new Date();
    }

    // Fetch jobs using jobViewModel and pass filters
    const result = await jobviewmodel.searchJobPosts({
      userId,
      jobTitle,
      companyName,
      location,
      jobType,
      pay,
      startDate,
      endDate,

    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.saveJobpost = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = req.user;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    const result = await jobviewmodel.saveJobpost(jobId, userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.appliedjob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = req.user;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    const result = await jobviewmodel.applyJobpost(jobId, userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

