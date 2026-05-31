/*
  Warnings:

  - Added the required column `uom_id` to the `purchase_order_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_order_line" ADD COLUMN     "uom_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_order_line" ADD CONSTRAINT "purchase_order_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
