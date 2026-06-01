/*
  Warnings:

  - Added the required column `tax_amount` to the `purchase_order_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_order_line" ADD COLUMN     "tax_amount" DOUBLE PRECISION NOT NULL;
