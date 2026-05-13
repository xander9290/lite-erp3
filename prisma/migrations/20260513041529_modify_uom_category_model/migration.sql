/*
  Warnings:

  - You are about to drop the column `label` on the `uom_category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `uom_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `uom_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "uom_category" DROP COLUMN "label",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "ratio" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX "uom_category_code_key" ON "uom_category"("code");
