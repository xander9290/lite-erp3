-- CreateEnum
CREATE TYPE "TaxTypeUse" AS ENUM ('sale', 'purchase');

-- CreateTable
CREATE TABLE "InvoicingTax" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type_use" "TaxTypeUse" NOT NULL DEFAULT 'sale',
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicingTax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoicingTax_name_key" ON "InvoicingTax"("name");
