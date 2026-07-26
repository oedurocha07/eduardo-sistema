-- CreateEnum
CREATE TYPE "StatusClienteRecorrente" AS ENUM ('ATIVO', 'PAUSADO', 'ENCERRADO');

-- CreateTable
CREATE TABLE "ClienteRecorrente" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpjCpf" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "status" "StatusClienteRecorrente" NOT NULL DEFAULT 'ATIVO',
    "valorMensal" DECIMAL(12,2),
    "diaVencimento" INTEGER,
    "descricaoServico" TEXT,
    "descricaoNbs" TEXT,
    "codigoServicoMunicipal" TEXT,
    "idClienteAsaas" TEXT,
    "enviarFaturaLocacao" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "sincronizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteRecorrente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClienteRecorrente_notionId_key" ON "ClienteRecorrente"("notionId");

-- CreateTable
CREATE TABLE "ItemLocado" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "clienteRecorrenteId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ItemLocado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemLocado_notionId_key" ON "ItemLocado"("notionId");

-- AddForeignKey
ALTER TABLE "ItemLocado" ADD CONSTRAINT "ItemLocado_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
