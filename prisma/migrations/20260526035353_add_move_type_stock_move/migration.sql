/*
  Warnings:

  - Added the required column `moveType` to the `stock_move` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockMoveType" AS ENUM ('out', 'in');

-- AlterTable
ALTER TABLE "stock_move" ADD COLUMN     "moveType" "StockMoveType" NOT NULL;
