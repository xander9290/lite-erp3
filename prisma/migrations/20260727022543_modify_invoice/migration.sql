/*
  Warnings:

  - Added the required column `cfdi_use` to the `invoicing_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CfdiUse" AS ENUM ('G01', 'G03', 'S01', 'CP01');

-- AlterTable
ALTER TABLE "invoicing_invoice" ADD COLUMN     "cfdi_use" "CfdiUse" NOT NULL;
