-- CreateEnum
CREATE TYPE "PurchaseLineStates" AS ENUM ('pending', 'invoiced', 'done');

-- AlterTable
ALTER TABLE "purchase_order_line" ADD COLUMN     "invoiced_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "received_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "state" "PurchaseLineStates" NOT NULL DEFAULT 'pending';
