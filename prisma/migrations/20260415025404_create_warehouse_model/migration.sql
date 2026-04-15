-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('SALES', 'SUPPLY', 'PRODUCTION', 'QUARANTINE', 'ADJUSTMENT', 'TRANSIT');

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL DEFAULT 'SALES',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" TEXT NOT NULL,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UsersWarehouseRel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UsersWarehouseRel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InternalsWarehouseRel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InternalsWarehouseRel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_name_key" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_description_key" ON "warehouses"("description");

-- CreateIndex
CREATE INDEX "_UsersWarehouseRel_B_index" ON "_UsersWarehouseRel"("B");

-- CreateIndex
CREATE INDEX "_InternalsWarehouseRel_B_index" ON "_InternalsWarehouseRel"("B");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsersWarehouseRel" ADD CONSTRAINT "_UsersWarehouseRel_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsersWarehouseRel" ADD CONSTRAINT "_UsersWarehouseRel_B_fkey" FOREIGN KEY ("B") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InternalsWarehouseRel" ADD CONSTRAINT "_InternalsWarehouseRel_A_fkey" FOREIGN KEY ("A") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InternalsWarehouseRel" ADD CONSTRAINT "_InternalsWarehouseRel_B_fkey" FOREIGN KEY ("B") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
