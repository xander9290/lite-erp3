-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "payment_term_id" TEXT;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
