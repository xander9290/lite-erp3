/*
  Warnings:

  - Added the required column `company_id` to the `stock_move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_move" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
