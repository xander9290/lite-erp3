/*
  Warnings:

  - You are about to drop the column `taxt_rate` on the `invoicing_invoice_line` table. All the data in the column will be lost.
  - Added the required column `tax_rate` to the `invoicing_invoice_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoicing_invoice_line" DROP COLUMN "taxt_rate",
ADD COLUMN     "tax_rate" DOUBLE PRECISION NOT NULL;
