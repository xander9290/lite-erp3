-- CreateEnum
CREATE TYPE "AuditlogActions" AS ENUM ('create', 'update', 'read', 'delete');

-- CreateTable
CREATE TABLE "auditlogs" (
    "id" TEXT NOT NULL,
    "action" "AuditlogActions" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "created_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditlogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auditlogs" ADD CONSTRAINT "auditlogs_created_uid_fkey" FOREIGN KEY ("created_uid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
