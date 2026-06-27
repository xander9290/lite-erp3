-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
