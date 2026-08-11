-- AlterTable
ALTER TABLE "Lancamento" ADD COLUMN "notionPageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lancamento_notionPageId_key" ON "Lancamento"("notionPageId");
