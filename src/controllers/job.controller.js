// src/controllers/user.controller.js
const jobviewmodel = require('../viewmodels/job.viewmodel');

// POST a new job
exports.postJob = async (req, res) => {
  try {
    const { jobTitle, companyName, location, description, applicationLink, companyIcon, status, time, salary } = req.body;
    console.log(time);
    console.log(salary);
    const result = await jobviewmodel.postJob(jobTitle, companyName, location, description, applicationLink, companyIcon, status, time, salary);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getJob = async (req, res) => {
    try {
      let { jobTitle, companyName, location } = req.body; 
  
      jobTitle = jobTitle ? jobTitle.toLowerCase() : '';
      companyName = companyName ? companyName.toLowerCase() : '';
      location = location ? location.toLowerCase() : '';
  
      // Fetch jobs using jobViewModel
      const result = await jobviewmodel.searchJobPosts(jobTitle, companyName, location);
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
  
