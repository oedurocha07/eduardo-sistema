-- Projeto ganha valor, briefing e notas pra area do cliente
ALTER TABLE "Projeto" ADD COLUMN "valor" DECIMAL(12,2);
ALTER TABLE "Projeto" ADD COLUMN "briefing" TEXT;
ALTER TABLE "Projeto" ADD COLUMN "areaClienteNotas" TEXT;

-- Entregaveis do projeto
CREATE TABLE "EntregavelProjeto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "entregue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntregavelProjeto_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EntregavelProjeto" ADD CONSTRAINT "EntregavelProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Marcos do projeto
CREATE TABLE "MarcoProjeto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarcoProjeto_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "MarcoProjeto" ADD CONSTRAINT "MarcoProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Equipe do projeto
CREATE TABLE "MembroEquipeProjeto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "cache" DECIMAL(12,2),
    "contato" TEXT,
    CONSTRAINT "MembroEquipeProjeto_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "MembroEquipeProjeto" ADD CONSTRAINT "MembroEquipeProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
