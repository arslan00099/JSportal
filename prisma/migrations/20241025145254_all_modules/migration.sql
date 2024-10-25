/*
  Warnings:

  - You are about to drop the column `companyName` on the `recruiterhiring` table. All the data in the column will be lost.
  - Added the required column `totalAmountDue` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalHourWorked` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPayableAmount` to the `TimeSheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profile` MODIFY `about` TEXT NULL;

-- AlterTable
ALTER TABLE `recruiterhiring` DROP COLUMN `companyName`;

-- AlterTable
ALTER TABLE `service` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `timesheet` ADD COLUMN `totalAmountDue` INTEGER NOT NULL,
    ADD COLUMN `totalHourWorked` INTEGER NOT NULL,
    ADD COLUMN `totalPayableAmount` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `TimeSheetTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
