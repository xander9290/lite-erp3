/*
  Warnings:

  - Added the required column `uom_id` to the `manufacturing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "manufacturing" ADD COLUMN     "uom_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "manufacturing" ADD CONSTRAINT "manufacturing_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
