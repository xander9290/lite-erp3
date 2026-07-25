/*
  Warnings:

  - Changed the type of `payment_form` on the `invoicing_invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice" DROP COLUMN "payment_form",
ADD COLUMN     "payment_form" "InvoicePaymentForm" NOT NULL;
