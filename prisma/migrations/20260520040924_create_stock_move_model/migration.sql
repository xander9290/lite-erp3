-- AlterEnum
ALTER TYPE "WarehouseType" ADD VALUE 'OUTGOING';

-- CreateTable
CREATE TABLE "stock_move" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "warehouse_dest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_move_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_warehouse_dest_id_fkey" FOREIGN KEY ("warehouse_dest_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
