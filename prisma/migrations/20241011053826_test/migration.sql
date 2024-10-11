/*
  Warnings:

  - You are about to drop the column `mentorProfileId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_mentorProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `mentorProfileId`,
    ADD COLUMN `mentorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `FK_User_Notification` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `FK_Mentor_Notification` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
