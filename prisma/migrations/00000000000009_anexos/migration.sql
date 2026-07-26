-- AlterTable: Documento passa a aceitar leadId, e clienteId vira opcional
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_clienteId_fkey";
ALTER TABLE "Documento" ALTER COLUMN "clienteId" DROP NOT NULL;
ALTER TABLE "Documento" ADD COLUMN "leadId" TEXT;
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Proposta ganha clienteId e arquivoUrl
ALTER TABLE "Proposta" ADD COLUMN "clienteId" TEXT;
ALTER TABLE "Proposta" ADD COLUMN "arquivoUrl" TEXT;
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Orcamento ganha arquivoUrl
ALTER TABLE "Orcamento" ADD COLUMN "arquivoUrl" TEXT;
