/*
  Warnings:

  - You are about to drop the column `tax_rate_id` on the `product_template` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_template" DROP CONSTRAINT "product_template_tax_rate_id_fkey";

-- AlterTable
ALTER TABLE "product_template" DROP COLUMN "tax_rate_id",
ADD COLUMN     "tax_purchase_id" TEXT,
ADD COLUMN     "tax_sale_id" TEXT;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_tax_sale_id_fkey" FOREIGN KEY ("tax_sale_id") REFERENCES "invoicing_tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_tax_purchase_id_fkey" FOREIGN KEY ("tax_purchase_id") REFERENCES "invoicing_tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
