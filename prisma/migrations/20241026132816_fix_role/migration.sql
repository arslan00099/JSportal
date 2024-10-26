/*
  Warnings:

  - The values [STAFF_MEMEBER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('JOB_SEEKER', 'MENTOR', 'RECRUITER', 'EMPLOYER', 'STAFF_MEMBER', 'ADMIN') NOT NULL;
