/*
  Warnings:

  - You are about to drop the `stock_picking_access` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_picking_access" DROP CONSTRAINT "stock_picking_access_company_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_picking_access" DROP CONSTRAINT "stock_picking_access_stock_picking_id_fkey";

-- DropTable
DROP TABLE "stock_picking_access";
