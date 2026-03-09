-- CreateIndex
CREATE INDEX "auditlogs_entity_type_entity_id_created_at_idx" ON "auditlogs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "auditlogs_created_uid_idx" ON "auditlogs"("created_uid");
