/*
  Warnings:

  - You are about to drop the column `jsId` on the `saveJobpost` table. All the data in the column will be lost.
  - Added the required column `userId` to the `saveJobpost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `saveJobpost` DROP FOREIGN KEY `saveJobpost_jsId_fkey`;

-- AlterTable
ALTER TABLE `saveJobpost` DROP COLUMN `jsId`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `saveJobpost` ADD CONSTRAINT `saveJobpost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
