-- CreateEnum
CREATE TYPE "PartnerDisplayType" AS ENUM ('INTERNAL', 'CUSTOMER', 'SUPPLIER', 'CONTACT', 'DELIVERY');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "display_type" "PartnerDisplayType" NOT NULL DEFAULT 'INTERNAL';
