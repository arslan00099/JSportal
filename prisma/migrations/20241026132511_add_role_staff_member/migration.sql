-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('JOB_SEEKER', 'MENTOR', 'RECRUITER', 'EMPLOYER', 'STAFF_MEMEBER', 'ADMIN') NOT NULL;