-- CreateEnum
CREATE TYPE "ProductPricelistItem" AS ENUM ('price1', 'price2', 'price3', 'price4', 'price5');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "payment_term_id" TEXT,
ADD COLUMN     "product_pricelist" "ProductPricelistItem";

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
