-- CreateEnum
CREATE TYPE "SaleOrderState" AS ENUM ('draft', 'sale', 'done', 'cancel');

-- CreateEnum
CREATE TYPE "SaleShippingWayType" AS ENUM ('counter', 'delivery', 'courier');

-- CreateTable
CREATE TABLE "sale_order" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_date" TIMESTAMP(3),
    "obs" TEXT,
    "purchase_ref" TEXT,
    "ref" TEXT,
    "state" "SaleOrderState" NOT NULL DEFAULT 'draft',
    "sale_user_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "partner_shipping_id" TEXT,
    "warehouse_id" TEXT NOT NULL,
    "shipping_way_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_shipping_way" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SaleShippingWayType" NOT NULL DEFAULT 'counter',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sale_shipping_way_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sale_order_name_key" ON "sale_order"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sale_shipping_way_name_key" ON "sale_shipping_way"("name");

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_sale_user_id_fkey" FOREIGN KEY ("sale_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_partner_shipping_id_fkey" FOREIGN KEY ("partner_shipping_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_shipping_way_id_fkey" FOREIGN KEY ("shipping_way_id") REFERENCES "sale_shipping_way"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
