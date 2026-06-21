-- CreateTable
CREATE TABLE "_PartnerTagsRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PartnerTagsRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PartnerTagsRelation_B_index" ON "_PartnerTagsRelation"("B");

-- AddForeignKey
ALTER TABLE "_PartnerTagsRelation" ADD CONSTRAINT "_PartnerTagsRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartnerTagsRelation" ADD CONSTRAINT "_PartnerTagsRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
