/*
  Warnings:

  - Made the column `payment_term_id` on table `purchase_order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "purchase_order" ALTER COLUMN "payment_term_id" SET NOT NULL;
