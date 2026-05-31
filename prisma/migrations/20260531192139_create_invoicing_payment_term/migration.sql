-- CreateTable
CREATE TABLE "invoicing_payment_term" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "days" INTEGER NOT NULL DEFAULT 0,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoicing_payment_term_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoicing_payment_term_name_key" ON "invoicing_payment_term"("name");
