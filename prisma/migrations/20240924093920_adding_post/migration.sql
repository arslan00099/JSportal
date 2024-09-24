/*
  Warnings:

  - You are about to drop the column `employerId` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `JobPost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `JobPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `JobApplication` DROP FOREIGN KEY `JobApplication_jobPostId_fkey`;

-- DropForeignKey
ALTER TABLE `JobPost` DROP FOREIGN KEY `JobPost_employerId_fkey`;

-- AlterTable
ALTER TABLE `JobPost` DROP COLUMN `employerId`,
    DROP COLUMN `title`,
    ADD COLUMN `companyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `jobTitle` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Location_userId_key` ON `Location`(`userId`);
