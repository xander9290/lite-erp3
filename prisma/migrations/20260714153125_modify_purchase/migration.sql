/*
  Warnings:

  - A unique constraint covering the columns `[purchase_id]` on the table `stock_picking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stock_picking_purchase_id_key" ON "stock_picking"("purchase_id");
