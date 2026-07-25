-- AlterTable
ALTER TABLE "invoicing_invoice" ADD COLUMN     "partner_shipping_id" TEXT;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_partner_shipping_id_fkey" FOREIGN KEY ("partner_shipping_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
