/*
  Warnings:

  - Added the required column `item_number` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice" ADD COLUMN     "item_number" INTEGER NOT NULL,
ADD COLUMN     "paymentState" "InvoicePaymentState";
