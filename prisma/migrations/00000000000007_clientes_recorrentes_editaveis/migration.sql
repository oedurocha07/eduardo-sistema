-- Torna ClienteRecorrente editável manualmente (não só via sync do Notion)
ALTER TABLE "ClienteRecorrente" ALTER COLUMN "notionId" DROP NOT NULL;
ALTER TABLE "ClienteRecorrente" ALTER COLUMN "sincronizadoEm" DROP NOT NULL;
ALTER TABLE "ClienteRecorrente" ALTER COLUMN "sincronizadoEm" DROP DEFAULT;
ALTER TABLE "ClienteRecorrente" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "ItemLocado" ALTER COLUMN "notionId" DROP NOT NULL;

-- Excluir cliente já remove os itens locados dele junto
ALTER TABLE "ItemLocado" DROP CONSTRAINT "ItemLocado_clienteRecorrenteId_fkey";
ALTER TABLE "ItemLocado" ADD CONSTRAINT "ItemLocado_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
