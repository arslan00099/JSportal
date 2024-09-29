/*
  Warnings:

  - You are about to drop the column `profileId` on the `MentorProfile` table. All the data in the column will be lost.
  - Added the required column `userId` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MentorProfile` DROP FOREIGN KEY `MentorProfile_profileId_fkey`;

-- AlterTable
ALTER TABLE `MentorProfile` DROP COLUMN `profileId`,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `totalReview` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MentorProfile` ADD CONSTRAINT `MentorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
