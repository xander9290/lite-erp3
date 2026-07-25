/*
  Warnings:

  - You are about to drop the column `currencyId` on the `invoicing_invoice` table. All the data in the column will be lost.
  - You are about to drop the column `journalId` on the `invoicing_invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTermId` on the `invoicing_invoice` table. All the data in the column will be lost.
  - You are about to drop the column `payment_term` on the `invoicing_invoice` table. All the data in the column will be lost.
  - Added the required column `currency_id` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `journal_id` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_policy` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_term_id` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoicePaymentPolicy" AS ENUM ('PUE', 'PPD');

-- CreateEnum
CREATE TYPE "InvoicePaymentForm" AS ENUM ('01', '02', '03', '04', '28', '99');

-- DropForeignKey
ALTER TABLE "invoicing_invoice" DROP CONSTRAINT "invoicing_invoice_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "invoicing_invoice" DROP CONSTRAINT "invoicing_invoice_journalId_fkey";

-- DropForeignKey
ALTER TABLE "invoicing_invoice" DROP CONSTRAINT "invoicing_invoice_paymentTermId_fkey";

-- AlterTable
ALTER TABLE "invoicing_invoice" DROP COLUMN "currencyId",
DROP COLUMN "journalId",
DROP COLUMN "paymentTermId",
DROP COLUMN "payment_term",
ADD COLUMN     "currency_id" TEXT NOT NULL,
ADD COLUMN     "journal_id" TEXT NOT NULL,
ADD COLUMN     "payment_policy" "InvoicePaymentPolicy" NOT NULL,
ADD COLUMN     "payment_term_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "InvoicePaymentMethod";

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "invoicing_journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
