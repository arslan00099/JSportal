/*
  Warnings:

  - Added the required column `description` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Made the column `startedOn` on table `Certificate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Certificate` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    MODIFY `startedOn` VARCHAR(191) NOT NULL;
