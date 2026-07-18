/*
  Warnings:

  - You are about to drop the `account_invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account_journal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account_invoice" DROP CONSTRAINT "account_invoice_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "account_invoice" DROP CONSTRAINT "account_invoice_journalId_fkey";

-- DropForeignKey
ALTER TABLE "account_invoice" DROP CONSTRAINT "account_invoice_partner_id_fkey";

-- DropForeignKey
ALTER TABLE "account_invoice" DROP CONSTRAINT "account_invoice_paymentTermId_fkey";

-- DropForeignKey
ALTER TABLE "account_journal" DROP CONSTRAINT "account_journal_companyId_fkey";

-- DropForeignKey
ALTER TABLE "account_journal" DROP CONSTRAINT "account_journal_currencyId_fkey";

-- DropTable
DROP TABLE "account_invoice";

-- DropTable
DROP TABLE "account_journal";

-- CreateTable
CREATE TABLE "invoicing_journal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "JournalType" NOT NULL DEFAULT 'sale',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "currencyId" TEXT,

    CONSTRAINT "invoicing_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoicing_invoice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "invoice_date" DATE NOT NULL,
    "invoice_date_due" DATE NOT NULL,
    "display_type" "InvoiceDisplayType" NOT NULL,
    "invoice_type" "InvoiceType" NOT NULL,
    "state" "InvoiceState" NOT NULL DEFAULT 'draft',
    "uuid_cfdi" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "payment_term" "InvoicePaymentMethod" NOT NULL,
    "payment_form" TEXT NOT NULL,
    "paymentTermId" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoicing_journal_name_key" ON "invoicing_journal"("name");

-- CreateIndex
CREATE UNIQUE INDEX "invoicing_invoice_name_key" ON "invoicing_invoice"("name");

-- AddForeignKey
ALTER TABLE "invoicing_journal" ADD CONSTRAINT "invoicing_journal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_journal" ADD CONSTRAINT "invoicing_journal_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "invoicing_payment_term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_invoice" ADD CONSTRAINT "invoicing_invoice_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "invoicing_journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
