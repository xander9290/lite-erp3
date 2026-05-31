/*
  Warnings:

  - Made the column `date_planned` on table `purchase_order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "purchase_order" ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "date_order" SET DATA TYPE TEXT,
ALTER COLUMN "date_planned" SET NOT NULL,
ALTER COLUMN "date_planned" SET DATA TYPE TEXT;
