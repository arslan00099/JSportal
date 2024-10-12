-- AlterTable
ALTER TABLE `MentorProfile` MODIFY `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `about` VARCHAR(191) NULL,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `language` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;
