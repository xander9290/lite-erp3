/*
  Warnings:

  - Added the required column `warehouse_affected_id` to the `purchase_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "warehouse_affected_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_warehouse_affected_id_fkey" FOREIGN KEY ("warehouse_affected_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
