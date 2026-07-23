/*
  Warnings:

  - You are about to drop the `InvoicingJournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoicingJournalLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "JournalType" ADD VALUE 'inventory';

-- DropForeignKey
ALTER TABLE "InvoicingJournalEntry" DROP CONSTRAINT "InvoicingJournalEntry_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoicingJournalEntry" DROP CONSTRAINT "InvoicingJournalEntry_journalId_fkey";

-- DropTable
DROP TABLE "InvoicingJournalEntry";

-- DropTable
DROP TABLE "InvoicingJournalLine";

-- CreateTable
CREATE TABLE "invoicing_journal_entry" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journalId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "stock_move_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_journal_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoicing_journal_entry_line" (
    "id" TEXT NOT NULL,
    "concept" "JournalLineConcept" NOT NULL,
    "debit" DECIMAL(16,2) NOT NULL,
    "credit" DECIMAL(16,2) NOT NULL,
    "entry_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_journal_entry_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoicing_journal_entry" ADD CONSTRAINT "invoicing_journal_entry_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "invoicing_journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_journal_entry" ADD CONSTRAINT "invoicing_journal_entry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoicing_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_journal_entry" ADD CONSTRAINT "invoicing_journal_entry_stock_move_id_fkey" FOREIGN KEY ("stock_move_id") REFERENCES "stock_move"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_journal_entry_line" ADD CONSTRAINT "invoicing_journal_entry_line_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "invoicing_journal_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
