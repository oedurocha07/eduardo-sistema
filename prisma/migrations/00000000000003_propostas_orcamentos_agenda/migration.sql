-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('RASCUNHO', 'ENVIADA', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('REUNIAO', 'GRAVACAO', 'EDICAO', 'ENTREGA', 'TAREFA', 'OUTRO');

-- CreateTable
CREATE TABLE "Proposta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "leadId" TEXT,
    "valor" DECIMAL(12,2),
    "status" "StatusProposta" NOT NULL DEFAULT 'RASCUNHO',
    "conteudo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "custoEstimado" DECIMAL(12,2) NOT NULL,
    "precoEstimado" DECIMAL(12,2) NOT NULL,
    "lucroEstimado" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'OUTRO',
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
