// src/viewmodels/settingJS.viewmodel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported here

class SettingJSViewmodel {

  // Method to update email
  async updateEmail(userId, primaryEmail, secondaryEmail) {
    try {
        console.log(userId);
        console.log(primaryEmail);
        console.log(secondaryEmail);
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          email: primaryEmail,
          secondaryEmail: secondaryEmail || null,
        },
      });
      delete user.password;
      return { success: true, user };
    } catch (error) {
      throw new Error(`Error updating email: ${error.message}`);
    }
  }

  // Method to update password
  async updatePassword(userId, currentPassword, newPassword) {
    console.log(userId);
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return { success: false, message: 'Incorrect current password' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return ('Password updated successfully' );

    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Method to deactivate user
  async deactivateUser(userId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return ('User account deactivated', user );
    } catch (error) {
      throw new Error(`Error deactivating account: ${error.message}`);
    }
  }

  // Method to delete user
  async deleteUser(userId) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      return ("User account deleted");
    } catch (error) {
      throw new Error(`Error deleting account: ${error.message}`);
    }
  }

}

module.exports = new SettingJSViewmodel();
