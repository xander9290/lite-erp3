-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "tax_rate_id" TEXT;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_tax_rate_id_fkey" FOREIGN KEY ("tax_rate_id") REFERENCES "invoicing_tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
