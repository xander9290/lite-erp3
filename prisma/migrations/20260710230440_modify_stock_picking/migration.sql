/*
  Warnings:

  - You are about to drop the column `compnay_dest_id` on the `stock_picking` table. All the data in the column will be lost.
  - Added the required column `company_dest_id` to the `stock_picking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_picking" DROP COLUMN "compnay_dest_id",
ADD COLUMN     "company_dest_id" TEXT NOT NULL;
