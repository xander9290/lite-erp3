/*
  Warnings:

  - Added the required column `payment_term_id` to the `sale_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sale_order" ADD COLUMN     "payment_term_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
