/*
  Warnings:

  - You are about to drop the column `ref` on the `sale_order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "ref",
ADD COLUMN     "reference" TEXT;
