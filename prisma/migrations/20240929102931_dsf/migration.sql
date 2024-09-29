/*
  Warnings:

  - You are about to drop the column `mentorId` on the `MentorSessionManagement` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `MentorSessionManagement` table. All the data in the column will be lost.
  - Added the required column `mentorProfileId` to the `MentorSessionManagement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_mentorId_fkey`;

-- AlterTable
ALTER TABLE `MentorSessionManagement` DROP COLUMN `mentorId`,
    DROP COLUMN `price`,
    ADD COLUMN `mentorProfileId` INTEGER NOT NULL,
    MODIFY `status` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'WAITING') NOT NULL DEFAULT 'ACCEPTED',
    MODIFY `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED';

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `MentorSessionManagement_mentorProfileId_fkey` FOREIGN KEY (`mentorProfileId`) REFERENCES `MentorProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
