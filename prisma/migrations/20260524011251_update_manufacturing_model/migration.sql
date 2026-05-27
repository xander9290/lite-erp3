/*
  Warnings:

  - You are about to drop the `Manufacturing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Manufacturing" DROP CONSTRAINT "Manufacturing_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Manufacturing" DROP CONSTRAINT "Manufacturing_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Manufacturing" DROP CONSTRAINT "Manufacturing_wh_dest_id_fkey";

-- DropForeignKey
ALTER TABLE "Manufacturing" DROP CONSTRAINT "Manufacturing_wh_origin_id_fkey";

-- DropForeignKey
ALTER TABLE "manufacturing_line" DROP CONSTRAINT "manufacturing_line_manufacturing_id_fkey";

-- DropTable
DROP TABLE "Manufacturing";

-- CreateTable
CREATE TABLE "manufacturing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "ManufacturingState" NOT NULL DEFAULT 'draft',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "product_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "wh_origin_id" TEXT NOT NULL,
    "wh_dest_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_name_key" ON "manufacturing"("name");

-- AddForeignKey
ALTER TABLE "manufacturing" ADD CONSTRAINT "manufacturing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing" ADD CONSTRAINT "manufacturing_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing" ADD CONSTRAINT "manufacturing_wh_origin_id_fkey" FOREIGN KEY ("wh_origin_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing" ADD CONSTRAINT "manufacturing_wh_dest_id_fkey" FOREIGN KEY ("wh_dest_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_line" ADD CONSTRAINT "manufacturing_line_manufacturing_id_fkey" FOREIGN KEY ("manufacturing_id") REFERENCES "manufacturing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
