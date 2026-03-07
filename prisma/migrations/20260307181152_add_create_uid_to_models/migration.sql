/*
  Warnings:

  - Added the required column `created_uid` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_uid` to the `partners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_uid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "created_uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "created_uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_uid" TEXT NOT NULL;
