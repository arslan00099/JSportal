/*
  Warnings:

  - Added the required column `companyIcon` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `JobApplication_jobPostId_fkey` ON `JobApplication`;

-- AlterTable
ALTER TABLE `JobPost` ADD COLUMN `companyIcon` VARCHAR(191) NOT NULL;
