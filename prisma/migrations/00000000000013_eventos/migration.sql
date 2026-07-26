-- Enums
CREATE TYPE "StatusEvento" AS ENUM ('PLANEJAMENTO', 'CONFIRMADO', 'AO_VIVO', 'ENCERRADO');
CREATE TYPE "FaseChecklist" AS ENUM ('PREPARACAO', 'MONTAGEM', 'OPERACAO', 'ENCERRAMENTO');
CREATE TYPE "StatusEquipamento" AS ENUM ('PENDENTE', 'SEPARADO', 'NO_LOCAL', 'DEVOLVIDO');
CREATE TYPE "TipoCustoEvento" AS ENUM ('CACHE', 'ADICIONAL', 'EQUIPAMENTO', 'TRANSPORTE', 'OUTRO');

-- EventoProducao
CREATE TABLE "EventoProducao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "local" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" "StatusEvento" NOT NULL DEFAULT 'PLANEJAMENTO',
    "clienteId" TEXT,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventoProducao_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EventoProducao" ADD CONSTRAINT "EventoProducao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AmbienteEvento
CREATE TABLE "AmbienteEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AmbienteEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AmbienteEvento" ADD CONSTRAINT "AmbienteEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BlocoOperacional
CREATE TABLE "BlocoOperacional" (
    "id" TEXT NOT NULL,
    "ambienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT,
    CONSTRAINT "BlocoOperacional_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "BlocoOperacional" ADD CONSTRAINT "BlocoOperacional_ambienteId_fkey" FOREIGN KEY ("ambienteId") REFERENCES "AmbienteEvento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MembroEquipeEvento
CREATE TABLE "MembroEquipeEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "dia" TIMESTAMP(3),
    "cache" DECIMAL(12,2),
    "contato" TEXT,
    CONSTRAINT "MembroEquipeEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "MembroEquipeEvento" ADD CONSTRAINT "MembroEquipeEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EquipamentoEvento
CREATE TABLE "EquipamentoEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "responsavel" TEXT,
    "status" "StatusEquipamento" NOT NULL DEFAULT 'PENDENTE',
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "EquipamentoEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EquipamentoEvento" ADD CONSTRAINT "EquipamentoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ChecklistItemEvento
CREATE TABLE "ChecklistItemEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fase" "FaseChecklist" NOT NULL DEFAULT 'PREPARACAO',
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChecklistItemEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ChecklistItemEvento" ADD CONSTRAINT "ChecklistItemEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CustoEvento
CREATE TABLE "CustoEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoCustoEvento" NOT NULL DEFAULT 'OUTRO',
    "valor" DECIMAL(12,2) NOT NULL,
    CONSTRAINT "CustoEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CustoEvento" ADD CONSTRAINT "CustoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ReferenciaEvento
CREATE TABLE "ReferenciaEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT,
    "arquivoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferenciaEvento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ReferenciaEvento" ADD CONSTRAINT "ReferenciaEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
