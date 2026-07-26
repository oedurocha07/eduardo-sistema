-- Lancamento ganha vinculo real com ClienteRecorrente e rastreio de origem (integracao Asaas)
ALTER TABLE "Lancamento" ADD COLUMN "clienteRecorrenteId" TEXT;
ALTER TABLE "Lancamento" ADD COLUMN "asaasPaymentId" TEXT;
ALTER TABLE "Lancamento" ADD COLUMN "origemIntegracao" TEXT;

CREATE UNIQUE INDEX "Lancamento_asaasPaymentId_key" ON "Lancamento"("asaasPaymentId");

ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
