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
router.get("/recruiters", middleware,main.getRecruiterList);
router.get("/recruiter/:recruiterId", middleware, main.getRecruiterDetails);
router.get(
  "/recruiter/timesheet/:recruiterId",
  middleware,
  main.getTimesheetListByRecruiterId
);
router.get(
  "/recruiter/timesheet/detail/:id",
  middleware,
  main.getTimesheetDetails
);
router.post("/hire", middleware, main.hireRecruiter);
router.get("/hired-recruiters", middleware, main.getHiredRecruiters);
router.get("/staff", middleware, main.getStaffMemberList);
router.get("/talents", main.getTalentList);
router.get("/talent/:id", middleware, main.getTalentDetail);
router.get("/counts", middleware, main.getCountsByEmployerId);
router.get("/activities", middleware, main.getActivities);

// CARD ROUTES
router.post("/cards", middleware, main.createCard);
router.get("/cards", middleware, main.getCards);
router.delete("/cards/:cardId", middleware, main.deleteCard);

//OTHER ROUTES

router.get("/getallrecruiter", middleware, allrecruiter.getallRecruiterProfile);
router.post("/postjob", middleware, timesheet.postJob);
router.post("/approveTimesheet", middleware, timesheet.approveTimesheet);
router.get("/timesheet", middleware, timesheet.getTimesheetsByRecruitingId);


//new
router.get("/getStaffMember/:employerId", middleware, main.getStaffMembersByEmployerCompany);
router.get("/getActivites", middleware, main.getActivities);
router.get("/subscription/:userId", middleware, main.getSubscriptionDetails);
router.get("/getAllstaffmembers", middleware, main.getAllStaffMembers);
router.put("/userSetting", middleware, main.manageUser);
router.post("/buySubscription", middleware, main.buySubscription);
router.get("/buySubscription/:userId", middleware, main.getBoughtSubscriptions);


//setting
router.put("/secondaryemail/:userId", middleware, main.updateEmail);
router.put("/changepassword/:userId", middleware, main.changePassword);
router.post("/deactivate/:userId", middleware, main.deactivateProfile);
router.delete("/account/:userId", middleware, main.deleteProfile);

//TransferAccount
router.post("/transferaccount", middleware, main.transferEmployerAccount);
router.post("/activecard", middleware, main.updateActiveCard);
router.get("/staffmemberDetails/:userId", middleware, main.getStafmemberDetails)

//Update point of contact

router.put("/pointofcontact", middleware, upload.none(), main.updatePointOfContact);


module.exports = router;
