/*
  Warnings:

  - The values [out,in] on the enum `StockMoveType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockMoveType_new" AS ENUM ('outgoing', 'incoming');
ALTER TABLE "stock_move" ALTER COLUMN "moveType" TYPE "StockMoveType_new" USING ("moveType"::text::"StockMoveType_new");
ALTER TYPE "StockMoveType" RENAME TO "StockMoveType_old";
ALTER TYPE "StockMoveType_new" RENAME TO "StockMoveType";
DROP TYPE "public"."StockMoveType_old";
COMMIT;
