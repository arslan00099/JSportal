/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `MentorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_mentorProfileId_fkey`;

-- AlterTable
ALTER TABLE `Notification` MODIFY `mentorProfileId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `MentorProfile_userId_key` ON `MentorProfile`(`userId`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_mentorProfileId_fkey` FOREIGN KEY (`mentorProfileId`) REFERENCES `MentorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
