/*
  Warnings:

  - You are about to drop the column `endDate` on the `recruiterhiring` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `recruiterhiring` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `recruiterhiring` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `recruiterhiring` table. All the data in the column will be lost.
  - You are about to drop the `hiredrecruiter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `hiredrecruiter` DROP FOREIGN KEY `HiredRecruiter_recruiterId_fkey`;

-- DropForeignKey
ALTER TABLE `hiredservice` DROP FOREIGN KEY `HiredService_hiredRecruiterId_fkey`;

-- DropForeignKey
ALTER TABLE `recruiterhiring` DROP FOREIGN KEY `RecruiterHiring_serviceId_fkey`;

-- AlterTable
ALTER TABLE `recruiterhiring` DROP COLUMN `endDate`,
    DROP COLUMN `serviceId`,
    DROP COLUMN `serviceName`,
    DROP COLUMN `startDate`;

-- DropTable
DROP TABLE `hiredrecruiter`;

-- AddForeignKey
ALTER TABLE `HiredService` ADD CONSTRAINT `HiredService_hiredRecruiterId_fkey` FOREIGN KEY (`hiredRecruiterId`) REFERENCES `RecruiterHiring`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
