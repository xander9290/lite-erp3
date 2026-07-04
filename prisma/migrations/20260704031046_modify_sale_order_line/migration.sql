-- DropForeignKey
ALTER TABLE "sale_order_line" DROP CONSTRAINT "sale_order_line_order_id_fkey";

-- AddForeignKey
ALTER TABLE "sale_order_line" ADD CONSTRAINT "sale_order_line_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sale_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
