/*
  Warnings:

  - Added the required column `userId` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jobpost` ADD COLUMN `maxPrice` VARCHAR(191) NULL,
    ADD COLUMN `minPrice` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `description` LONGTEXT NOT NULL,
    MODIFY `companyIcon` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JobPost` ADD CONSTRAINT `JobPost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
