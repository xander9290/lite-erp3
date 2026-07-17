/*
  Warnings:

  - Added the required column `create_uid` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_type` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_type` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `journalId` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partner_id` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTermId` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_form` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_term` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_amount` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `account_invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid_cfdi` to the `account_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JournalType" AS ENUM ('sale', 'purchase', 'cash', 'bank', 'general');

-- CreateEnum
CREATE TYPE "InvoiceDisplayType" AS ENUM ('customer', 'supplier');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('sale_invoice', 'purchase_invoice', 'credit_note', 'debit_note');

-- CreateEnum
CREATE TYPE "InvoiceState" AS ENUM ('draft', 'confirmed', 'sent', 'partial', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "InvoicePaymentMethod" AS ENUM ('PUE', 'PPD');

-- AlterTable
ALTER TABLE "account_invoice" ADD COLUMN     "create_uid" TEXT NOT NULL,
ADD COLUMN     "currencyId" TEXT NOT NULL,
ADD COLUMN     "display_type" "InvoiceDisplayType" NOT NULL,
ADD COLUMN     "invoice_type" "InvoiceType" NOT NULL,
ADD COLUMN     "journalId" TEXT NOT NULL,
ADD COLUMN     "partner_id" TEXT NOT NULL,
ADD COLUMN     "paymentTermId" TEXT NOT NULL,
ADD COLUMN     "payment_form" TEXT NOT NULL,
ADD COLUMN     "payment_term" "InvoicePaymentMethod" NOT NULL,
ADD COLUMN     "state" "InvoiceState" NOT NULL DEFAULT 'draft',
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "uuid_cfdi" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AccountJournal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "JournalType" NOT NULL DEFAULT 'sale',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "currencyId" TEXT,

    CONSTRAINT "AccountJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountJournal_name_key" ON "AccountJournal"("name");

-- AddForeignKey
ALTER TABLE "AccountJournal" ADD CONSTRAINT "AccountJournal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountJournal" ADD CONSTRAINT "AccountJournal_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invoice" ADD CONSTRAINT "account_invoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invoice" ADD CONSTRAINT "account_invoice_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invoice" ADD CONSTRAINT "account_invoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invoice" ADD CONSTRAINT "account_invoice_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "AccountJournal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
