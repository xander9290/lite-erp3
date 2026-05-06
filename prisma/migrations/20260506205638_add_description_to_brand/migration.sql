-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "product_brand_id" TEXT;

-- CreateTable
CREATE TABLE "product_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_brand_name_key" ON "product_brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_brand_description_key" ON "product_brand"("description");

-- CreateIndex
CREATE UNIQUE INDEX "product_brand_code_key" ON "product_brand"("code");

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_product_brand_id_fkey" FOREIGN KEY ("product_brand_id") REFERENCES "product_brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
