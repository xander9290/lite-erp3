/*
  Warnings:

  - You are about to drop the `_UsersWarehouseRel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UsersWarehouseRel" DROP CONSTRAINT "_UsersWarehouseRel_A_fkey";

-- DropForeignKey
ALTER TABLE "_UsersWarehouseRel" DROP CONSTRAINT "_UsersWarehouseRel_B_fkey";

-- DropTable
DROP TABLE "_UsersWarehouseRel";
