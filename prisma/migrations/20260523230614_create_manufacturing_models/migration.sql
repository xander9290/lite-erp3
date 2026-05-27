-- CreateEnum
CREATE TYPE "ManufacturingState" AS ENUM ('draft', 'in_process', 'finished', 'affected', 'cancel');

-- CreateTable
CREATE TABLE "Manufacturing" (
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

    CONSTRAINT "Manufacturing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManufacturingLine" (
    "id" TEXT NOT NULL,
    "out_qty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "manufacturing_id" TEXT NOT NULL,
    "product_ingredient_id" TEXT NOT NULL,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManufacturingLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturing_name_key" ON "Manufacturing"("name");

-- AddForeignKey
ALTER TABLE "Manufacturing" ADD CONSTRAINT "Manufacturing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturing" ADD CONSTRAINT "Manufacturing_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturing" ADD CONSTRAINT "Manufacturing_wh_origin_id_fkey" FOREIGN KEY ("wh_origin_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturing" ADD CONSTRAINT "Manufacturing_wh_dest_id_fkey" FOREIGN KEY ("wh_dest_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingLine" ADD CONSTRAINT "ManufacturingLine_manufacturing_id_fkey" FOREIGN KEY ("manufacturing_id") REFERENCES "Manufacturing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingLine" ADD CONSTRAINT "ManufacturingLine_product_ingredient_id_fkey" FOREIGN KEY ("product_ingredient_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
