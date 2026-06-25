/*
  Warnings:

  - Added the required column `currency_id` to the `purchase_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "currency_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
