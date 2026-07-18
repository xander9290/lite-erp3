-- CreateEnum
CREATE TYPE "JournalLineConcept" AS ENUM ('customer', 'supplier', 'sale', 'purchase', 'vat', 'payment', 'discount', 'shipping');

-- CreateTable
CREATE TABLE "InvoicingJournalEntry" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journalId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicingJournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicingJournalLine" (
    "id" TEXT NOT NULL,
    "concept" "JournalLineConcept" NOT NULL,
    "debit" DECIMAL(16,2) NOT NULL,
    "credit" DECIMAL(16,2) NOT NULL,

    CONSTRAINT "InvoicingJournalLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoicingJournalEntry" ADD CONSTRAINT "InvoicingJournalEntry_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "invoicing_journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicingJournalEntry" ADD CONSTRAINT "InvoicingJournalEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoicing_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
