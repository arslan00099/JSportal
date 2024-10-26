-- CreateTable
CREATE TABLE `HiredRecruiter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recruiterId` INTEGER NULL,
    `employerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HiredService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hiredRecruiterId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HiredRecruiter` ADD CONSTRAINT `HiredRecruiter_recruiterId_fkey` FOREIGN KEY (`recruiterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HiredService` ADD CONSTRAINT `HiredService_hiredRecruiterId_fkey` FOREIGN KEY (`hiredRecruiterId`) REFERENCES `HiredRecruiter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HiredService` ADD CONSTRAINT `HiredService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
