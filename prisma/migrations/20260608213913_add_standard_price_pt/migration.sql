-- AlterTable
ALTER TABLE "manufacturing" ADD COLUMN     "price_unit" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "manufacturing_line" ADD COLUMN     "price_unit" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
