/*
  Warnings:

  - You are about to drop the `_CompanyRel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanyRel" DROP CONSTRAINT "_CompanyRel_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyRel" DROP CONSTRAINT "_CompanyRel_B_fkey";

-- DropTable
DROP TABLE "_CompanyRel";

-- CreateTable
CREATE TABLE "stock_picking_access" (
    "id" TEXT NOT NULL,
    "stock_picking_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "stock_picking_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_picking_access_stock_picking_id_company_id_key" ON "stock_picking_access"("stock_picking_id", "company_id");

-- AddForeignKey
ALTER TABLE "stock_picking_access" ADD CONSTRAINT "stock_picking_access_stock_picking_id_fkey" FOREIGN KEY ("stock_picking_id") REFERENCES "stock_picking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking_access" ADD CONSTRAINT "stock_picking_access_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
