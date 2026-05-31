/*
  Warnings:

  - The `date_planned` column on the `purchase_order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `date_order` on the `purchase_order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "date_order",
ADD COLUMN     "date_order" DATE NOT NULL,
DROP COLUMN "date_planned",
ADD COLUMN     "date_planned" DATE,
ALTER COLUMN "date" DROP DEFAULT;
