// src/controllers/auth.controller.js

const userViewModel = require('../viewmodels/user.viewmodel'); // Ensure only one instance
const crypto = require("crypto");
const { sendEmail } = require("../emailService"); // Adjust path
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require("dotenv").config();

const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  console.log("Signup route hit");
  try {
    const { username, password, email, role, fullname } = req.body;
    console.log(username);
    console.log(password);
    console.log(email);
    console.log(role);

    let avatarId = null;
    if (req.file) {
      avatarId = req.file.filename; // Save the file name to use as avatarId
    } else {
      console.log("No file uploaded in the request.");
    }

    const user = await userViewModel.signup(username, password, email, role, fullname, avatarId);

    // Remove keys with null values from the user object
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );

    res.status(201).json({ success: true, data: filteredUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userViewModel.login(email, password);

    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );

    res.status(200).json({ success: true, token, data: filteredUser });
  } catch (error) {
    if (error.message === "Account deactivated") {
      return res.status(403).json({ success: false, message: "Your account is deactivated" });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};




exports.adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userViewModel.adminLogin(email, password);
    // Remove keys with null values from the user object
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );
    res.status(200).json({ success: true, token, data: filteredUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};




exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save to user
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email
    const resetUrl = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;

    await sendEmail(
      email,
      "Reset Your Password - WwFuseww",
      `Reset your password using this link: ${resetUrl}`, // plain text fallback
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">
          Hello,
        </p>
        <p style="color: #555;">
          We received a request to reset your password for your WwFuseww account. Click the button below to reset it:
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 14px;">
          If you didn’t request a password reset, you can ignore this email.
        </p>
        <p style="color: #aaa; font-size: 12px; margin-top: 30px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          &mdash; The WwFuseww Team
        </p>
      </div>
      `
    );

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ success: false, message: "Reset token and password are required." });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};

