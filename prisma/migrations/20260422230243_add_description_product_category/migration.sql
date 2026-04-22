/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `product_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `product_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_category" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "product_category_description_key" ON "product_category"("description");
