-- AlterTable
ALTER TABLE "product_category" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
