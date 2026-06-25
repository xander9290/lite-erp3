-- AlterTable
ALTER TABLE "partners" ALTER COLUMN "imageUrl" SET DEFAULT '/images/avatar_default.svg';

-- CreateTable
CREATE TABLE "invoicing_currency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "invoicing_currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_invoice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "invoice_date" DATE NOT NULL,
    "invoice_date_due" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_invoice_name_key" ON "account_invoice"("name");
