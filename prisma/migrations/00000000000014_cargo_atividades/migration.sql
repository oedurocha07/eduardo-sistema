-- Usuario ganha cargo
ALTER TABLE "Usuario" ADD COLUMN "cargo" TEXT;

-- Atividades do lead
CREATE TYPE "TipoAtividade" AS ENUM ('NOTA', 'MUDANCA_ETAPA', 'TEMPERATURA', 'PROXIMA_ACAO', 'CRIACAO');

CREATE TABLE "AtividadeLead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "tipo" "TipoAtividade" NOT NULL DEFAULT 'NOTA',
    "descricao" TEXT NOT NULL,
    "autor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AtividadeLead_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AtividadeLead" ADD CONSTRAINT "AtividadeLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
