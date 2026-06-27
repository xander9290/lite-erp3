-- DropForeignKey
ALTER TABLE "partners" DROP CONSTRAINT "partners_parent_id_fkey";

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
