-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN "clienteRecorrenteId" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN "clienteRecorrenteId" TEXT;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
