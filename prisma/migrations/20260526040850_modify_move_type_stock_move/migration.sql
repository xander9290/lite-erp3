/*
  Warnings:

  - You are about to drop the column `moveType` on the `stock_move` table. All the data in the column will be lost.
  - Added the required column `move_type` to the `stock_move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_move" DROP COLUMN "moveType",
ADD COLUMN     "move_type" "StockMoveType" NOT NULL;
