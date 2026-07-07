-- CreateEnum
CREATE TYPE "SaleOrderLineState" AS ENUM ('pending', 'reserved', 'delivered', 'invoiced', 'cancled');

-- AlterTable
ALTER TABLE "sale_order_line" ADD COLUMN     "state" "SaleOrderLineState" NOT NULL DEFAULT 'pending';
