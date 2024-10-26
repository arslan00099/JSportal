-- AlterTable
ALTER TABLE `profile` ADD COLUMN `companyLink` VARCHAR(191) NULL,
    ADD COLUMN `companySize` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `EmployerPointOfContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `jobRole` VARCHAR(191) NULL,
    `phnumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `contactNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployerPointOfContact` ADD CONSTRAINT `EmployerPointOfContact_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
