/*
  Warnings:

  - You are about to drop the `ProductReceiptLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductReceiptLine" DROP CONSTRAINT "ProductReceiptLine_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductReceiptLine" DROP CONSTRAINT "ProductReceiptLine_uom_id_fkey";

-- DropTable
DROP TABLE "ProductReceiptLine";

-- CreateTable
CREATE TABLE "product_receipt_line" (
    "id" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "product_id" TEXT NOT NULL,
    "uom_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_receipt_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_receipt_line" ADD CONSTRAINT "product_receipt_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_receipt_line" ADD CONSTRAINT "product_receipt_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
