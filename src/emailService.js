const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  SMTP_FROM_EMAIL,
  SMTP_PASSWORD,
} = process.env;

console.log("Initializing transporter...");
console.log("SMTP_FROM_EMAIL:", SMTP_FROM_EMAIL ? "Loaded" : "Not Loaded");
console.log("SMTP_PASSWORD:", SMTP_PASSWORD ? "Loaded" : "Not Loaded");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: SMTP_FROM_EMAIL,
    pass: SMTP_PASSWORD, // App password if using Gmail
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

exports.sendEmail = async (to, subject, text, html) => {
  console.log("Preparing to send email...");
  console.log("To:", to);
  console.log("Subject:", subject);

  const mailOptions = {
    from: `"NO_REPLY" <${SMTP_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
