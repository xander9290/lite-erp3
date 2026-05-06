/*
  Warnings:

  - Added the required column `entity_name` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "entity_name" TEXT NOT NULL;
