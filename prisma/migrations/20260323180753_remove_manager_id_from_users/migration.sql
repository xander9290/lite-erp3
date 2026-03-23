/*
  Warnings:

  - You are about to drop the column `manager_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_manager_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "manager_id";
