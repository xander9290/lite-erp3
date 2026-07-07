/*
  Warnings:

  - A unique constraint covering the columns `[product_id,parent_id]` on the table `product_receipt_line` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "product_receipt_line_product_id_parent_id_key" ON "product_receipt_line"("product_id", "parent_id");
