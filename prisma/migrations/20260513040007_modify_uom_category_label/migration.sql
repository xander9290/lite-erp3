/*
  Warnings:

  - Made the column `label` on table `uom_category` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "uom_category" ALTER COLUMN "label" SET NOT NULL;
