-- CreateTable
CREATE TABLE "purchase_order_line" (
    "id" TEXT NOT NULL,
    "price_unit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_order_line" ADD CONSTRAINT "purchase_order_line_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_line" ADD CONSTRAINT "purchase_order_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
