/*
  Warnings:

  - You are about to drop the column `employerId` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `fuseAdminId` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `recruiterId` on the `TimeSheet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TimeSheet` table. All the data in the column will be lost.
  - Added the required column `date` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industries` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectDiscription` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recruitingId` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceFee` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `services` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `TimeSheet` DROP FOREIGN KEY `TimeSheet_employerId_fkey`;

-- DropForeignKey
ALTER TABLE `TimeSheet` DROP FOREIGN KEY `TimeSheet_fuseAdminId_fkey`;

-- DropForeignKey
ALTER TABLE `TimeSheet` DROP FOREIGN KEY `TimeSheet_recruiterId_fkey`;

-- AlterTable
ALTER TABLE `TimeSheet` DROP COLUMN `employerId`,
    DROP COLUMN `fuseAdminId`,
    DROP COLUMN `recruiterId`,
    DROP COLUMN `status`,
    ADD COLUMN `approvalStatusEmp` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `day` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    ADD COLUMN `hours` INTEGER NOT NULL,
    ADD COLUMN `industries` VARCHAR(191) NOT NULL,
    ADD COLUMN `projectDiscription` VARCHAR(191) NOT NULL,
    ADD COLUMN `projectName` VARCHAR(191) NOT NULL,
    ADD COLUMN `recruitingId` INTEGER NOT NULL,
    ADD COLUMN `serviceFee` INTEGER NOT NULL,
    ADD COLUMN `services` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TimeSheet` ADD CONSTRAINT `TimeSheet_recruitingId_fkey` FOREIGN KEY (`recruitingId`) REFERENCES `RecruiterHiring`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
