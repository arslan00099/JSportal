-- DropForeignKey
ALTER TABLE `certificate` DROP FOREIGN KEY `Certificate_userId_fkey`;

-- DropForeignKey
ALTER TABLE `education` DROP FOREIGN KEY `Education_userId_fkey`;

-- DropForeignKey
ALTER TABLE `empolymenthistory` DROP FOREIGN KEY `EmpolymentHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `location` DROP FOREIGN KEY `Location_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpolymentHistory` ADD CONSTRAINT `EmpolymentHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
