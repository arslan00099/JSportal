-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_mentorProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_selectedService_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_userId_fkey`;

-- AlterTable
ALTER TABLE `MentorSessionManagement` MODIFY `selectedService` INTEGER NULL,
    MODIFY `selectedDateTime` DATETIME(3) NULL,
    MODIFY `status` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'WAITING') NULL DEFAULT 'ACCEPTED',
    MODIFY `userId` INTEGER NULL,
    MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NULL DEFAULT 'COMPLETED',
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL,
    MODIFY `mentorProfileId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `MentorSessionManagement_selectedService_fkey` FOREIGN KEY (`selectedService`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `MentorSessionManagement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `MentorSessionManagement_mentorProfileId_fkey` FOREIGN KEY (`mentorProfileId`) REFERENCES `MentorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
