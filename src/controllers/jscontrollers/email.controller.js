const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'yahoo', 'hotmail'
  auth: {
    user: 'your_email@gmail.com', // Your email address
    pass: 'your_email_password',   // Your email password or app-specific password
  },
});

// Setup email data
const mailOptions = {
  from: '"Your Name" <your_email@gmail.com>', // Sender address
  to: 'recipient@example.com',               // List of recipients
  subject: 'Hello from Nodemailer!',          // Subject line
  text: 'Hello world!',                       // Plain text body
  html: '<b>Hello world!</b>',                // HTML body content
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
});
