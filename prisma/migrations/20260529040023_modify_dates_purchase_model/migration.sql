/*
  Warnings:

  - The values [confirmed] on the enum `PurchaseOrderState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PurchaseOrderState_new" AS ENUM ('draft', 'purchase', 'done', 'cancel');
ALTER TABLE "public"."purchase_order" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "purchase_order" ALTER COLUMN "state" TYPE "PurchaseOrderState_new" USING ("state"::text::"PurchaseOrderState_new");
ALTER TYPE "PurchaseOrderState" RENAME TO "PurchaseOrderState_old";
ALTER TYPE "PurchaseOrderState_new" RENAME TO "PurchaseOrderState";
DROP TYPE "public"."PurchaseOrderState_old";
ALTER TABLE "purchase_order" ALTER COLUMN "state" SET DEFAULT 'draft';
COMMIT;
