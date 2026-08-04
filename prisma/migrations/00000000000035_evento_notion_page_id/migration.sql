-- AlterTable
ALTER TABLE "Evento" ADD COLUMN "notionPageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Evento_notionPageId_key" ON "Evento"("notionPageId");
