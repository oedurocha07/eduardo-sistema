-- AlterTable
ALTER TABLE "ClienteRecorrente" ADD COLUMN "empresaId" TEXT,
ADD COLUMN "valorTrabalho" DECIMAL(12,2),
ADD COLUMN "formaPagamento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ClienteRecorrente_empresaId_key" ON "ClienteRecorrente"("empresaId");

-- AddForeignKey
ALTER TABLE "ClienteRecorrente" ADD CONSTRAINT "ClienteRecorrente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
