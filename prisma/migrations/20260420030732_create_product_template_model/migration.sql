-- CreateTable
CREATE TABLE "product_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default_code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sales" BOOLEAN NOT NULL DEFAULT true,
    "purchases" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT DEFAULT '/image/avatar_default.svg',
    "price_1" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "price_2" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "price_3" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "price_4" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "price_5" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "last_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "ancho" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "alto" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "largo" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "uom_incoming_allowed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "uom_outgoing_allowed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "supplier_id" TEXT,
    "user_id" TEXT,
    "create_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductTemplateToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductTemplateToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_template_name_key" ON "product_template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_template_description_key" ON "product_template"("description");

-- CreateIndex
CREATE UNIQUE INDEX "product_template_default_code_key" ON "product_template"("default_code");

-- CreateIndex
CREATE INDEX "_ProductTemplateToTag_B_index" ON "_ProductTemplateToTag"("B");

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTemplateToTag" ADD CONSTRAINT "_ProductTemplateToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "product_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTemplateToTag" ADD CONSTRAINT "_ProductTemplateToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
