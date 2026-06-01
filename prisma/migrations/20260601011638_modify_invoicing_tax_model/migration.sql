/*
  Warnings:

  - You are about to drop the `InvoicingTax` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InvoicingTax";

-- CreateTable
CREATE TABLE "invoicing_tax" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type_use" "TaxTypeUse" NOT NULL DEFAULT 'sale',
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_tax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoicing_tax_name_key" ON "invoicing_tax"("name");
