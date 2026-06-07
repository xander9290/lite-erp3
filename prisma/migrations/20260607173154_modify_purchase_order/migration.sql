-- AlterTable
ALTER TABLE "purchase_order_line" ADD COLUMN     "pending_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
