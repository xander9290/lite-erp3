-- DropForeignKey
ALTER TABLE "manufacturing_line" DROP CONSTRAINT "manufacturing_line_manufacturing_id_fkey";

-- AddForeignKey
ALTER TABLE "manufacturing_line" ADD CONSTRAINT "manufacturing_line_manufacturing_id_fkey" FOREIGN KEY ("manufacturing_id") REFERENCES "manufacturing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
