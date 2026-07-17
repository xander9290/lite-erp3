/*
  Warnings:

  - You are about to drop the `AccountJournal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountJournal" DROP CONSTRAINT "AccountJournal_companyId_fkey";

-- DropForeignKey
ALTER TABLE "AccountJournal" DROP CONSTRAINT "AccountJournal_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "account_invoice" DROP CONSTRAINT "account_invoice_journalId_fkey";

-- DropTable
DROP TABLE "AccountJournal";

-- CreateTable
CREATE TABLE "account_journal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "JournalType" NOT NULL DEFAULT 'sale',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "currencyId" TEXT,

    CONSTRAINT "account_journal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_journal_name_key" ON "account_journal"("name");

-- AddForeignKey
ALTER TABLE "account_journal" ADD CONSTRAINT "account_journal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_journal" ADD CONSTRAINT "account_journal_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "invoicing_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invoice" ADD CONSTRAINT "account_invoice_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "account_journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
