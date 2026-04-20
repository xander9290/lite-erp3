/*
  Warnings:

  - Added the required column `display_type` to the `product_template` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductDisplayType" AS ENUM ('CONSU', 'SERVICE', 'PRODUCT');

-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "display_type" "ProductDisplayType" NOT NULL;
