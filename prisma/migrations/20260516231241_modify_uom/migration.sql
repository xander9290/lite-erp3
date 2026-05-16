/*
  Warnings:

  - You are about to drop the `uom_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_packaging_line" DROP CONSTRAINT "product_packaging_line_uom_id_fkey";

-- DropForeignKey
ALTER TABLE "product_receipt_line" DROP CONSTRAINT "product_receipt_line_uom_id_fkey";

-- DropForeignKey
ALTER TABLE "product_template" DROP CONSTRAINT "product_template_uom_id_fkey";

-- DropTable
DROP TABLE "uom_category";

-- CreateTable
CREATE TABLE "product_uom_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_base_unit" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_uom_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_uom_category_name_key" ON "product_uom_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_uom_category_description_key" ON "product_uom_category"("description");

-- CreateIndex
CREATE UNIQUE INDEX "product_uom_category_code_key" ON "product_uom_category"("code");

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packaging_line" ADD CONSTRAINT "product_packaging_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_receipt_line" ADD CONSTRAINT "product_receipt_line_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "product_uom_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
