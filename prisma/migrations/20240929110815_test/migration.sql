/*
  Warnings:

  - Made the column `userId` on table `MentorSessionManagement` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `MentorSessionManagement` DROP FOREIGN KEY `MentorSessionManagement_userId_fkey`;

-- AlterTable
ALTER TABLE `MentorSessionManagement` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MentorSessionManagement` ADD CONSTRAINT `MentorSessionManagement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
