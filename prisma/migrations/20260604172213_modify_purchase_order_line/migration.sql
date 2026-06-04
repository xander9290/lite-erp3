/*
  Warnings:

  - The values [done] on the enum `PurchaseLineStates` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PurchaseLineStates_new" AS ENUM ('pending', 'invoiced');
ALTER TABLE "public"."purchase_order_line" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "purchase_order_line" ALTER COLUMN "state" TYPE "PurchaseLineStates_new" USING ("state"::text::"PurchaseLineStates_new");
ALTER TYPE "PurchaseLineStates" RENAME TO "PurchaseLineStates_old";
ALTER TYPE "PurchaseLineStates_new" RENAME TO "PurchaseLineStates";
DROP TYPE "public"."PurchaseLineStates_old";
ALTER TABLE "purchase_order_line" ALTER COLUMN "state" SET DEFAULT 'pending';
COMMIT;
