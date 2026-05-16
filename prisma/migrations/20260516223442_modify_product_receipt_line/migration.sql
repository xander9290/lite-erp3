/*
  Warnings:

  - Added the required column `parent_id` to the `product_receipt_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_receipt_line" ADD COLUMN     "parent_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "product_receipt_line" ADD CONSTRAINT "product_receipt_line_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
