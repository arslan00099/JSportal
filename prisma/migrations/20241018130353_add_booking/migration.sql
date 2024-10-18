/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `mentorId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `recruiterId` on the `Booking` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(8))`.
  - Added the required column `employerId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_recruiterId_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `date`,
    DROP COLUMN `duration`,
    DROP COLUMN `mentorId`,
    DROP COLUMN `recruiterId`,
    ADD COLUMN `employerId` INTEGER NOT NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NULL DEFAULT 'COMPLETED',
    ADD COLUMN `recId` INTEGER NOT NULL,
    ADD COLUMN `selectedDateTime` DATETIME(3) NULL,
    ADD COLUMN `selectedService` INTEGER NULL,
    MODIFY `status` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'WAITING') NULL DEFAULT 'ACCEPTED',
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_selectedService_fkey` FOREIGN KEY (`selectedService`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_recId_fkey` FOREIGN KEY (`recId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
