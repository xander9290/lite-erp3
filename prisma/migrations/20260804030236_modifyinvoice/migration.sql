/*
  Warnings:

  - You are about to drop the column `item_number` on the `invoicing_invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentState` on the `invoicing_invoice` table. All the data in the column will be lost.
  - Added the required column `item_number` to the `invoicing_invoice_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice" DROP COLUMN "item_number",
DROP COLUMN "paymentState",
ADD COLUMN     "payment_state" "InvoicePaymentState" NOT NULL DEFAULT 'notPaid';

-- AlterTable
ALTER TABLE "invoicing_invoice_line" ADD COLUMN     "item_number" INTEGER NOT NULL;
