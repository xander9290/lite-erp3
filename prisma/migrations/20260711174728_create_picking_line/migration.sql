-- CreateTable
CREATE TABLE "StockPickingLine" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "delivered" DOUBLE PRECISION NOT NULL,
    "uom_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "picking_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockPickingLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockPickingLine" ADD CONSTRAINT "StockPickingLine_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPickingLine" ADD CONSTRAINT "StockPickingLine_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPickingLine" ADD CONSTRAINT "StockPickingLine_picking_id_fkey" FOREIGN KEY ("picking_id") REFERENCES "stock_picking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
