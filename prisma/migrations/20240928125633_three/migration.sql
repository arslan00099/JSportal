/*
  Warnings:

  - Added the required column `jobType` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `JobPost` ADD COLUMN `jobType` VARCHAR(191) NOT NULL;
