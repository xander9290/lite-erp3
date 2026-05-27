/*
  Warnings:

  - You are about to drop the `ManufacturingLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ManufacturingLine" DROP CONSTRAINT "ManufacturingLine_manufacturing_id_fkey";

-- DropForeignKey
ALTER TABLE "ManufacturingLine" DROP CONSTRAINT "ManufacturingLine_product_ingredient_id_fkey";

-- DropTable
DROP TABLE "ManufacturingLine";

-- CreateTable
CREATE TABLE "manufacturing_line" (
    "id" TEXT NOT NULL,
    "out_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "manufacturing_id" TEXT NOT NULL,
    "product_ingredient_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "manufacturing_line" ADD CONSTRAINT "manufacturing_line_manufacturing_id_fkey" FOREIGN KEY ("manufacturing_id") REFERENCES "Manufacturing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_line" ADD CONSTRAINT "manufacturing_line_product_ingredient_id_fkey" FOREIGN KEY ("product_ingredient_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
