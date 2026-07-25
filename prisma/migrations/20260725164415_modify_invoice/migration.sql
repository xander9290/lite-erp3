/*
  Warnings:

  - You are about to drop the column `ref` on the `invoicing_invoice` table. All the data in the column will be lost.
  - Added the required column `reference` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice" DROP COLUMN "ref",
ADD COLUMN     "reference" TEXT NOT NULL;
