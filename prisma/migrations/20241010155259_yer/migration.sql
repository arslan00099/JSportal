-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_mentorProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_userId_fkey`;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `FK_User_Session` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `FK_Mentor_Session` FOREIGN KEY (`mentorProfileId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
