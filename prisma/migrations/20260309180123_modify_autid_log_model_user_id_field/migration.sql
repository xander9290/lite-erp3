/*
  Warnings:

  - You are about to drop the column `created_uid` on the `auditlogs` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `auditlogs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auditlogs" DROP CONSTRAINT "auditlogs_created_uid_fkey";

-- DropIndex
DROP INDEX "auditlogs_created_uid_idx";

-- AlterTable
ALTER TABLE "auditlogs" DROP COLUMN "created_uid",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "auditlogs_user_id_idx" ON "auditlogs"("user_id");

-- AddForeignKey
ALTER TABLE "auditlogs" ADD CONSTRAINT "auditlogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
