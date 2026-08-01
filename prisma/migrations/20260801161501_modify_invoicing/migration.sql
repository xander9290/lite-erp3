-- AlterTable
ALTER TABLE "invoicing_invoice" ADD COLUMN     "purchaseId" TEXT,
ADD COLUMN     "saleId" TEXT;

-- CreateTable
CREATE TABLE "invoicing_invoice_line" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price_unit" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "amount_untaxed" DOUBLE PRECISION NOT NULL,
    "amount_tax" DOUBLE PRECISION NOT NULL,
    "amount_total" DOUBLE PRECISION NOT NULL,
    "product_last_cost" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "default_code" TEXT,
    "description" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "uom_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoicing_invoice_line_invoice_id_idx" ON "invoicing_invoice_line"("invoice_id");

-- CreateIndex
CREATE INDEX "invoicing_invoice_partner_id_idx" ON "invoicing_invoice"("partner_id");

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice_line" ADD CONSTRAINT "invoicing_invoice_line_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoicing_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice_line" ADD CONSTRAINT "invoicing_invoice_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice_line" ADD CONSTRAINT "invoicing_invoice_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
