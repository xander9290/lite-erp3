/*
  Warnings:

  - Added the required column `compnay_dest_id` to the `stock_picking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_picking" ADD COLUMN     "compnay_dest_id" TEXT NOT NULL;
