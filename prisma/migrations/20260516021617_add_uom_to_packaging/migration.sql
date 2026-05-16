/*
  Warnings:

  - Added the required column `uom_id` to the `product_packaging_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_packaging_line" ADD COLUMN     "uom_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "product_packaging_line" ADD CONSTRAINT "product_packaging_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
