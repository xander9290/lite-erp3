-- AlterTable
ALTER TABLE "product_template" ADD COLUMN     "uom_id" TEXT;

-- CreateTable
CREATE TABLE "uom_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uom_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uom_category_name_key" ON "uom_category"("name");

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
