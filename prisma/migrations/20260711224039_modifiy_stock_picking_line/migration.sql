/*
  Warnings:

  - You are about to drop the `StockPickingLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockPickingLine" DROP CONSTRAINT "StockPickingLine_picking_id_fkey";

-- DropForeignKey
ALTER TABLE "StockPickingLine" DROP CONSTRAINT "StockPickingLine_product_id_fkey";

-- DropForeignKey
ALTER TABLE "StockPickingLine" DROP CONSTRAINT "StockPickingLine_uom_id_fkey";

-- DropTable
DROP TABLE "StockPickingLine";

-- CreateTable
CREATE TABLE "stock_picking_line" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "delivered" DOUBLE PRECISION NOT NULL,
    "uom_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "picking_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_picking_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_picking_line" ADD CONSTRAINT "stock_picking_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking_line" ADD CONSTRAINT "stock_picking_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking_line" ADD CONSTRAINT "stock_picking_line_picking_id_fkey" FOREIGN KEY ("picking_id") REFERENCES "stock_picking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
