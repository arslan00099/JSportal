/*
  Warnings:

  - Added the required column `about` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languages` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagline` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalReview` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricing` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MentorProfile` DROP FOREIGN KEY `MentorProfile_profileId_fkey`;

-- AlterTable
ALTER TABLE `MentorProfile` ADD COLUMN `about` VARCHAR(191) NOT NULL,
    ADD COLUMN `languages` VARCHAR(191) NOT NULL,
    ADD COLUMN `rating` INTEGER NOT NULL,
    ADD COLUMN `tagline` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalReview` INTEGER NOT NULL,
    MODIFY `profileId` INTEGER NULL,
    MODIFY `linkedinProfile` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `pricing` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MentorProfile` ADD CONSTRAINT `MentorProfile_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
