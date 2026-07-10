-- CreateEnum
CREATE TYPE "PickingOperationType" AS ENUM ('outgoing', 'incoming', 'internal');

-- AlterTable
ALTER TABLE "stock_picking" ADD COLUMN     "operationType" "PickingOperationType" NOT NULL DEFAULT 'internal';
