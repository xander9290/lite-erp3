-- AlterTable
ALTER TABLE "invoicing_journal_entry" ADD COLUMN     "stock_picking_id" TEXT;

-- AddForeignKey
ALTER TABLE "invoicing_journal_entry" ADD CONSTRAINT "invoicing_journal_entry_stock_picking_id_fkey" FOREIGN KEY ("stock_picking_id") REFERENCES "stock_picking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
