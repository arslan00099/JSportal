const express = require("express");
const router = express.Router();

const allrecruiter = require("../../controllers/employercontrollers/fetchallrecruiter");
const timesheet = require("../../controllers/timesheetcontrollers/timesheet");
const main = require("../../controllers/employercontrollers/main.controller");
const middleware = require("../../middleware/middleware");
const upload = require("../../middleware/multerConfig");

// PROFILE ROUTES
router.post(
  "/profile",
  upload.single("profilePic"),
  middleware,
  main.updateProfile
);
router.post("/location", middleware, main.updateLocation);
router.get("/profile", middleware, main.getProfile);

// DASHBOARD ROUTES
// JOB ROUTES
router.get("/jobs", middleware, main.getJobs);
router.post("/job", middleware, main.createJob);
router.get("/job/:jobId", middleware, main.getJobDetail);
router.patch("/job/:jobId", middleware, main.updateJob);
router.delete("/job/:jobId", middleware, main.deleteJob);
router.get("/job-applied/:jobId", middleware, main.getAppliedJobsByJobId);
router.get("/recruiters", middleware, main.getRecruiterList);
router.get("/recruiter/:recruiterId", middleware, main.getRecruiterDetails);
router.post("/hire", middleware, main.hireRecruiter);
router.get("/hired-recruiters", middleware, main.getHiredRecruiters);
router.get("/staff", middleware, main.getStaffMemberList);
router.get("/talents", middleware, main.getTalentList);
router.get("/talents/:id", middleware, main.getTalentDetail);
router.get("/counts", middleware, main.getCountsByEmployerId);
router.get("/activities", middleware, main.getActivities);

// CARD ROUTES
router.post("/cards", middleware, main.createCard);
router.get("/cards", middleware, main.getCards);
router.delete("/cards/:cardId", middleware, main.deleteCard);

//OTHER ROUTES

router.get("/getallrecruiter", allrecruiter.getallRecruiterProfile);
router.post("/postjob", timesheet.postJob);
router.post("/approveTimesheet", timesheet.approveTimesheet);
router.get("/timesheet", timesheet.getTimesheetsByRecruitingId);

module.exports = router;
