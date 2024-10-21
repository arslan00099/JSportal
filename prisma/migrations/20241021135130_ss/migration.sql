/*
  Warnings:

  - The values [ACCEPTED] on the enum `RecruiterHiring_adminApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACCEPTED] on the enum `RecruiterHiring_recruiterApprovalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID') NULL DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE `MentorSessionManagement` MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID') NULL DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE `RecruiterHiring` ADD COLUMN `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID') NULL,
    MODIFY `adminApprovalStatus` ENUM('APPROVED', 'DECLINED', 'CANCELLED', 'PENDING') NOT NULL,
    MODIFY `recruiterApprovalStatus` ENUM('APPROVED', 'DECLINED', 'CANCELLED', 'PENDING') NOT NULL;
