/*
  Warnings:

  - You are about to drop the column `mentorProfileId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_mentorProfileId_fkey`;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `mentorProfileId`,
    ADD COLUMN `mentorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
