/*
  Warnings:

  - You are about to drop the column `invoice_type` on the `invoicing_invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice" DROP COLUMN "invoice_type";

-- DropEnum
DROP TYPE "InvoiceType";
