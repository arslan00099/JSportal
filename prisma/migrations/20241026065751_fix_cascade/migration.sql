-- DropForeignKey
ALTER TABLE `adminprofile` DROP FOREIGN KEY `AdminProfile_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `documents` DROP FOREIGN KEY `Documents_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employerprofile` DROP FOREIGN KEY `EmployerProfile_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `jobapplied` DROP FOREIGN KEY `JobApplied_userId_fkey`;

-- DropForeignKey
ALTER TABLE `jobseekerprofile` DROP FOREIGN KEY `JobSeekerProfile_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `mentorprofile` DROP FOREIGN KEY `MentorProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `mentorsessionmanagement` DROP FOREIGN KEY `FK_User_Session`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `FK_User_Notification`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `recruiterprofile` DROP FOREIGN KEY `RecruiterProfile_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `savejobpost` DROP FOREIGN KEY `SaveJobpost_userId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_mentorId_fkey`;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobSeekerProfile` ADD CONSTRAINT `JobSeekerProfile_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documents` ADD CONSTRAINT `Documents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaveJobpost` ADD CONSTRAINT `SaveJobpost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplied` ADD CONSTRAINT `JobApplied_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `FK_User_Notification` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorProfile` ADD CONSTRAINT `MentorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `FK_User_Session` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecruiterProfile` ADD CONSTRAINT `RecruiterProfile_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployerProfile` ADD CONSTRAINT `EmployerProfile_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
