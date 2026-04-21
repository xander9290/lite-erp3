-- CreateEnum
CREATE TYPE "ProductStateType" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE');

-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "state" "ProductStateType" NOT NULL DEFAULT 'AVAILABLE';
