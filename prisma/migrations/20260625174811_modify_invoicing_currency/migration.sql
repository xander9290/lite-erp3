/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `invoicing_currency` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invoicing_currency_name_key" ON "invoicing_currency"("name");
