/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `invoicing_journal_entry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invoicing_journal_entry_invoiceId_key" ON "invoicing_journal_entry"("invoiceId");
