const JSviewmodel = require('../../viewmodels/mentorviewmodels/setting.viewmodel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported here


const changeEmail = async (req, res) => {
  const { primaryEmail, secondaryEmail } = req.body; // Extract email data from request body
  const { userId } = req.user; // Extract userId from request (usually from JWT or session)

  try {
    // Logging for debugging purposes
    console.log(userId);
    console.log(primaryEmail);
    console.log(secondaryEmail);

    // Update user's primary and secondary emails using Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: primaryEmail, // Update primary email
        secondaryEmail: secondaryEmail || null, // Update secondary email, or set it to null if not provided
      },
    });

    // Remove sensitive information (e.g., password) before returning the response
    delete user.password;

    // Respond with success and updated user data
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    // Handle any errors and respond with an appropriate error message
    console.error('Error updating email:', error.message);
    res.status(400).json({ success: false, message: 'Unable to update email' });
  }
};


const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body; // Extracting passwords from the request body
  const { userId } = req.user; // Extracting userId from the authenticated user

  try {
    // Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare the current password with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    // If the current password does not match, return an error
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Respond with success message
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    // Handle any errors and respond with an appropriate error message
    console.error('Error updating password:', error.message);
    res.status(500).json({ success: false, message: 'Unable to update password' });
  }
};


const deactivateUser = async (req, res) => {
  const { userId } = req.user; // Extracting userId from the authenticated user

  try {
    // Update the user's account status to inactive
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Responding with success message and updated user data
    res.status(200).json({ success: true, message: 'User account deactivated', data: user });
  } catch (error) {
    // Handling any errors and sending response
    console.error('Error deactivating account:', error.message);
    res.status(400).json({ success: false, message: 'Unable to deactivate account' });
  }
};


const deleteUser = async (req, res) => {
  const { userId } = req.user;

  try {

    const result = await JSviewmodel.deleteUser(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: 'Unable to delete account' });
  }
};

module.exports = {
  changeEmail,
  changePassword,
  deactivateUser,
  deleteUser,
};
