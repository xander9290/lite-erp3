-- CreateTable
CREATE TABLE "stock_warehouse" (
    "id" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reserved_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "locationName" TEXT,
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_warehouse_product_id_warehouse_id_key" ON "stock_warehouse"("product_id", "warehouse_id");

-- AddForeignKey
ALTER TABLE "stock_warehouse" ADD CONSTRAINT "stock_warehouse_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_warehouse" ADD CONSTRAINT "stock_warehouse_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
