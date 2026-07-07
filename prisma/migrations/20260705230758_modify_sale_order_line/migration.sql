/*
  Warnings:

  - The values [invoiced] on the enum `SaleOrderLineState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SaleOrderLineState_new" AS ENUM ('pending', 'reserved', 'delivered', 'cancel');
ALTER TABLE "public"."sale_order_line" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "sale_order_line" ALTER COLUMN "state" TYPE "SaleOrderLineState_new" USING ("state"::text::"SaleOrderLineState_new");
ALTER TYPE "SaleOrderLineState" RENAME TO "SaleOrderLineState_old";
ALTER TYPE "SaleOrderLineState_new" RENAME TO "SaleOrderLineState";
DROP TYPE "public"."SaleOrderLineState_old";
ALTER TABLE "sale_order_line" ALTER COLUMN "state" SET DEFAULT 'pending';
COMMIT;
