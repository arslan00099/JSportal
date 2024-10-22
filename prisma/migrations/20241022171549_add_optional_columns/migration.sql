/*
  Warnings:

  - You are about to drop the column `date` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `hours` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `industries` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `projectDiscription` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `projectName` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `serviceFee` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `TimeSheet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `status` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'WAITING', 'DECLINE') NULL DEFAULT 'ACCEPTED',
    MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID', 'DECLINE') NULL DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE `MentorSessionManagement` MODIFY `status` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'WAITING', 'DECLINE') NULL DEFAULT 'ACCEPTED',
    MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID', 'DECLINE') NULL DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE `RecruiterHiring` MODIFY `adminApprovalStatus` ENUM('ACCEPTED', 'APPROVED', 'DECLINED', 'DECLINE', 'CANCELLED', 'PENDING') NOT NULL,
    MODIFY `recruiterApprovalStatus` ENUM('ACCEPTED', 'APPROVED', 'DECLINED', 'CANCELLED', 'PENDING', 'DECLINE') NOT NULL,
    MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PAID', 'DECLINE') NULL;

-- AlterTable
ALTER TABLE `TimeSheet` DROP COLUMN `date`,
    DROP COLUMN `day`,
    DROP COLUMN `hours`,
    DROP COLUMN `industries`,
    DROP COLUMN `projectDiscription`,
    DROP COLUMN `projectName`,
    DROP COLUMN `serviceFee`,
    DROP COLUMN `services`,
    ADD COLUMN `HiredBy` VARCHAR(191) NULL,
    ADD COLUMN `independentContracter` BOOLEAN NULL,
    ADD COLUMN `managingSupervion` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `recruiterName` VARCHAR(191) NULL,
    ADD COLUMN `sendChargestoFuse` BOOLEAN NULL,
    ADD COLUMN `sendingtoclient` BOOLEAN NULL,
    ADD COLUMN `weeklyTimesheet` JSON NULL;
