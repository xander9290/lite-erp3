-- CreateTable
CREATE TABLE "ProductReceiptLine" (
    "id" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "product_id" TEXT NOT NULL,
    "uom_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReceiptLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductReceiptLine" ADD CONSTRAINT "ProductReceiptLine_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReceiptLine" ADD CONSTRAINT "ProductReceiptLine_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
