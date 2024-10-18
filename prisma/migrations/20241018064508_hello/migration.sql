-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `industry` VARCHAR(191) NULL,
    ADD COLUMN `services` VARCHAR(191) NULL,
    MODIFY `fullname` VARCHAR(191) NULL,
    MODIFY `phnumber` INTEGER NULL;
