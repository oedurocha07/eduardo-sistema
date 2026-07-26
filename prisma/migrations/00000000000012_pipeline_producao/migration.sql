-- Novo enum de pipeline de producao
CREATE TYPE "EtapaProducao" AS ENUM ('BRIEFING', 'PRE_PRODUCAO', 'CAPTACAO', 'EDICAO', 'REVISAO', 'ENTREGA', 'CONCLUIDA');

-- Migra Projeto.status do enum antigo pro novo, preservando dados existentes
ALTER TABLE "Projeto" ADD COLUMN "status_new" "EtapaProducao";

UPDATE "Projeto" SET "status_new" = CASE
  WHEN "status" = 'ATIVO' THEN 'EDICAO'::"EtapaProducao"
  WHEN "status" = 'EM_APROVACAO' THEN 'REVISAO'::"EtapaProducao"
  WHEN "status" = 'CONCLUIDO' THEN 'CONCLUIDA'::"EtapaProducao"
  WHEN "status" = 'ARQUIVADO' THEN 'CONCLUIDA'::"EtapaProducao"
  ELSE 'BRIEFING'::"EtapaProducao"
END;

ALTER TABLE "Projeto" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "Projeto" ALTER COLUMN "status_new" SET DEFAULT 'BRIEFING';
ALTER TABLE "Projeto" DROP COLUMN "status";
ALTER TABLE "Projeto" RENAME COLUMN "status_new" TO "status";
DROP TYPE "StatusProjeto";

-- CreateTable: Tarefa
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "prazo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
