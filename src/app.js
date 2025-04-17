// src/app.js

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/jsroutes/user.routes");
const jobRoutes = require("./routes/jsroutes/job.routes");
const notificationRoutes = require("./routes/jsroutes/notification.routes");
const settingJS = require("./routes/jsroutes/settingJS.routes");

const MentorProfile = require("./routes/mentorroutes/mentorProfile.routes");
const getMentorforJS = require("./routes/jsroutes/getmentor.routes");
const RecruiterProfile = require("./routes/recruiterroutes/recruiterProfile.routes");
const employer = require("./routes/employerroutes/employerroutes");
const admin = require("./routes/adminroutes/admin");

const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();
const cors = require("cors");
const corsOptions = {
  credentials: true,
  origin: "*", // Allow requests from any origin
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
const { PrismaClient } = require("@prisma/client");
const path = require("path");

// Serve static files from the 'utils/profilephoto' directory
app.use("/utils/profilephotos", express.static(path.join(__dirname, "utils/profilephotos")));
app.use("/utils/resume", express.static(path.join(__dirname, "utils/resume")));
app.use("/utils/video", express.static(path.join(__dirname, "utils/video")));

// Initialize Prisma Client
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test connection by querying the database
    await prisma.$connect();
    console.log("Connection to MySQL database successful!");
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error.message);
  } finally {
    // Ensure that the Prisma Client is disconnected when finished
    await prisma.$disconnect();
  }
}

// Call the function to test the connection
testConnection();


app.get('/api/', (req, res) => {
  res.send('Backend Server is running');
});

////////////////////////////////////////////////////
///////////    JOB SEEKER ROUTERS   ////////////////
////////////////////////////////////////////////////
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/setting", settingJS);
app.use("/api/getMentorforJs", getMentorforJS);

////////////////////////////////////////////////////
/////////////    MENTOR ROUTERS   //////////////////
////////////////////////////////////////////////////
app.use("/api/mentor/", MentorProfile);

////////////////////////////////////////////////////
/////////////    Recruiter ROUTERS   ///////////////
////////////////////////////////////////////////////
app.use("/api/Recruiter/", RecruiterProfile);

////////////////////////////////////////////////////
/////////////    EMPLOYER ROUTERS   ////////////////
////////////////////////////////////////////////////
app.use("/api/employer/", employer);

////////////////////////////////////////////////////
/////////////    ADMIN ROUTERS   //////////////////
////////////////////////////////////////////////////
app.use("/api/admin/", admin);



module.exports = app;
