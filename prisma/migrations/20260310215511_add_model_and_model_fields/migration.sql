-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('string', 'number', 'relation', 'action', 'link', 'boolean', 'date', 'datetime');

-- CreateTable
CREATE TABLE "GroupLine" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "invisible" BOOLEAN NOT NULL DEFAULT false,
    "readonly" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "not_create" BOOLEAN NOT NULL DEFAULT false,
    "not_edit" BOOLEAN NOT NULL DEFAULT false,
    "model_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "model_id" TEXT NOT NULL,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "models_name_key" ON "models"("name");

-- CreateIndex
CREATE UNIQUE INDEX "models_label_key" ON "models"("label");

-- CreateIndex
CREATE UNIQUE INDEX "model_fields_name_key" ON "model_fields"("name");

-- CreateIndex
CREATE UNIQUE INDEX "model_fields_label_key" ON "model_fields"("label");

-- AddForeignKey
ALTER TABLE "GroupLine" ADD CONSTRAINT "GroupLine_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_fields" ADD CONSTRAINT "model_fields_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
