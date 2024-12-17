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
app.use("/utils/profilephotos",express.static(path.join(__dirname, "utils/profilephotos")));
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
/////////////    Recruiter ROUTERS   //////////////////
////////////////////////////////////////////////////
app.use("/api/Recruiter/", RecruiterProfile);

////////////////////////////////////////////////////
/////////////    EMPLOYER ROUTERS   //////////////////
////////////////////////////////////////////////////
app.use("/api/employer/", employer);

////////////////////////////////////////////////////
/////////////    ADMIN ROUTERS   //////////////////
////////////////////////////////////////////////////
app.use("/api/admin/", admin);


// Function to send test email
async function sendTestMail(sendTo, testMessage, testValue) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "i2058@gmail.com",
      pass: "dhhjdhiklmxcphne",
    },
  });

  let mailOptions = {
    from: '"NO REPLY" <itsfabulous2058@gmail.com>',
    to: sendTo,
    subject: "Test your Email",
    text: `Hello,\n\n${testMessage}\n\nTest Value: ${testValue}\n\nIf you receive this email, it means your email configuration is working correctly.\n\nBest regards`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

// Route to send test email
app.post("/send-email", async (req, res) => {
  const { email, testMessage, testValue } = req.body;

  if (!email || !testMessage || !testValue) {
    return res
      .status(400)
      .json({ error: "Email, testMessage, and testValue are required." });
  }

  try {
    await sendTestMail(email, testMessage, testValue);
    res.json({ message: "Email sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email." });
  }
});

module.exports = app;
