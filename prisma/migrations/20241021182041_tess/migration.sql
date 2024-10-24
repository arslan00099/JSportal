-- AlterTable
ALTER TABLE `JobApplication` MODIFY `jobStatus` ENUM('OPEN', 'HIRED', 'CLOSED', 'CANCELLED', 'ONHOLD', 'IN_PROGRESS', 'COMPLETED') NOT NULL;

-- AlterTable
ALTER TABLE `JobPost` MODIFY `status` ENUM('OPEN', 'HIRED', 'CLOSED', 'CANCELLED', 'ONHOLD', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `RecruiterHiring` MODIFY `jobStatus` ENUM('OPEN', 'HIRED', 'CLOSED', 'CANCELLED', 'ONHOLD', 'IN_PROGRESS', 'COMPLETED') NOT NULL;
