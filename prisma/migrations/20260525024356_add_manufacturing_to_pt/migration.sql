-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "manufacturing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "yield" DOUBLE PRECISION NOT NULL DEFAULT 0.00;
