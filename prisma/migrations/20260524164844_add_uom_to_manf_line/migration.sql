/*
  Warnings:

  - Added the required column `uom_id` to the `manufacturing_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "manufacturing_line" ADD COLUMN     "uom_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "manufacturing_line" ADD CONSTRAINT "manufacturing_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
