-- AlterTable
ALTER TABLE `RecruiterHiring` MODIFY `recruiterApprovalStatus` ENUM('ACCEPTED', 'DECLINED', 'CANCELLED', 'PENDING') NOT NULL;
