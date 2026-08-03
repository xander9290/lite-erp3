/*
  Warnings:

  - Added the required column `taxt_rate` to the `invoicing_invoice_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice_line" ADD COLUMN     "taxt_rate" DOUBLE PRECISION NOT NULL;
