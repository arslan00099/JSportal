/*
  Warnings:

  - You are about to drop the column `status` on the `hiredservice` table. All the data in the column will be lost.
  - Added the required column `status` to the `HiredRecruiter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hiredrecruiter` ADD COLUMN `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `hiredservice` DROP COLUMN `status`;
