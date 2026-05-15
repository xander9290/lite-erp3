-- CreateTable
CREATE TABLE "product_packaging" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_packaging_line" (
    "id" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "packagin_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_packaging_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_packaging_name_key" ON "product_packaging"("name");

-- AddForeignKey
ALTER TABLE "product_packaging_line" ADD CONSTRAINT "product_packaging_line_packagin_id_fkey" FOREIGN KEY ("packagin_id") REFERENCES "product_packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packaging_line" ADD CONSTRAINT "product_packaging_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
