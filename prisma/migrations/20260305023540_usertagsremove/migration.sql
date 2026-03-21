/*
  Warnings:

  - You are about to drop the column `userId` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `_TagToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_B_fkey";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "userId";

-- DropTable
DROP TABLE "_TagToUser";
