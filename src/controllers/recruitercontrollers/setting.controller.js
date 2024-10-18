const JSviewmodel = require('../../viewmodels/mentorviewmodels/setting.viewmodel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported here


const changeEmail = async (req, res) => {
  const { primaryEmail, secondaryEmail } = req.body;
  const { userId } = req.user;
  try {
    const result = await JSviewmodel.updateEmail(userId, primaryEmail, secondaryEmail);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: 'Unable to update email' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;
  try {
    const result = await JSviewmodel.updatePassword(userId, currentPassword, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: 'Unable to update password' });
  }
};

const deactivateUser = async (req, res) => {
  const { userId } = req.user;

  try {

    const result = await JSviewmodel.deactivateUser(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: 'Unable to deactivate account' });
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
