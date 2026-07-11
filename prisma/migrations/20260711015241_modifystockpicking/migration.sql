/*
  Warnings:

  - Added the required column `company_origin_id` to the `stock_picking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_picking" ADD COLUMN     "company_origin_id" TEXT NOT NULL;
