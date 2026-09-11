-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "journal_id" TEXT;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "invoicing_journal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
