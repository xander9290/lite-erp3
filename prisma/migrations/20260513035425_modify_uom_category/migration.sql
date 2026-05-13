/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `uom_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `uom_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "uom_category" ADD COLUMN     "description" TEXT NOT NULL,
ALTER COLUMN "label" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "uom_category_description_key" ON "uom_category"("description");
