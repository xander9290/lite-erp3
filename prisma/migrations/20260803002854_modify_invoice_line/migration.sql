/*
  Warnings:

  - The values [partial,paid] on the enum `InvoiceState` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvoicePaymentState" AS ENUM ('partial', 'paid','notPaid');

-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceState_new" AS ENUM ('draft', 'confirmed', 'sent', 'cancelled');
ALTER TABLE "public"."invoicing_invoice" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "invoicing_invoice" ALTER COLUMN "state" TYPE "InvoiceState_new" USING ("state"::text::"InvoiceState_new");
ALTER TYPE "InvoiceState" RENAME TO "InvoiceState_old";
ALTER TYPE "InvoiceState_new" RENAME TO "InvoiceState";
DROP TYPE "public"."InvoiceState_old";
ALTER TABLE "invoicing_invoice" ALTER COLUMN "state" SET DEFAULT 'draft';
COMMIT;
