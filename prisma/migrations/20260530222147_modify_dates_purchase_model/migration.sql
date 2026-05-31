/*
  Warnings:

  - The `date` column on the `purchase_order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "date",
ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
