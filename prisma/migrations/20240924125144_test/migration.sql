-- CreateTable
CREATE TABLE `saveJobpost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` INTEGER NOT NULL,
    `jsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `saveJobpost` ADD CONSTRAINT `saveJobpost_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `JobPost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saveJobpost` ADD CONSTRAINT `saveJobpost_jsId_fkey` FOREIGN KEY (`jsId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
