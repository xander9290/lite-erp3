-- CreateEnum
CREATE TYPE "StockPickingState" AS ENUM ('draft', 'confirmed', 'ready', 'done', 'cancel');

-- CreateTable
CREATE TABLE "stock_picking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePlanned" DATE NOT NULL,
    "confirmed_date" TIMESTAMP(3),
    "ready_date" TIMESTAMP(3),
    "done_date" TIMESTAMP(3),
    "reference" TEXT,
    "state" "StockPickingState" NOT NULL DEFAULT 'draft',
    "wh_id" TEXT NOT NULL,
    "wh_dest_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "operator_id" TEXT,
    "company_id" TEXT NOT NULL,
    "sale_id" TEXT,
    "purchase_id" TEXT,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_picking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyRel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyRel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_picking_name_key" ON "stock_picking"("name");

-- CreateIndex
CREATE INDEX "_CompanyRel_B_index" ON "_CompanyRel"("B");

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_wh_id_fkey" FOREIGN KEY ("wh_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_wh_dest_id_fkey" FOREIGN KEY ("wh_dest_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_picking" ADD CONSTRAINT "stock_picking_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyRel" ADD CONSTRAINT "_CompanyRel_A_fkey" FOREIGN KEY ("A") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyRel" ADD CONSTRAINT "_CompanyRel_B_fkey" FOREIGN KEY ("B") REFERENCES "stock_picking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
