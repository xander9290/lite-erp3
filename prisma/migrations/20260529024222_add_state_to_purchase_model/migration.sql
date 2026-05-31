-- CreateEnum
CREATE TYPE "PurchaseOrderState" AS ENUM ('draft', 'confirmed', 'purchase', 'done', 'cancel');

-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "state" "PurchaseOrderState" NOT NULL DEFAULT 'draft';
