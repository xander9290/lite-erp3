/*
  Warnings:

  - You are about to drop the column `datePlanned` on the `stock_picking` table. All the data in the column will be lost.
  - You are about to drop the column `operationType` on the `stock_picking` table. All the data in the column will be lost.
  - Added the required column `date_planned` to the `stock_picking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_picking" DROP COLUMN "datePlanned",
DROP COLUMN "operationType",
ADD COLUMN     "date_planned" DATE NOT NULL,
ADD COLUMN     "operation_type" "PickingOperationType" NOT NULL DEFAULT 'internal';
