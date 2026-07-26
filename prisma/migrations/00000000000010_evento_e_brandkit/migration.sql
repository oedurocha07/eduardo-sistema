-- AlterTable: Evento ganha dataFim, local, participantes
ALTER TABLE "Evento" ADD COLUMN "dataFim" TIMESTAMP(3);
ALTER TABLE "Evento" ADD COLUMN "local" TEXT;
ALTER TABLE "Evento" ADD COLUMN "participantes" TEXT;

-- AlterTable: Configuracao ganha corDestaque
ALTER TABLE "Configuracao" ADD COLUMN "corDestaque" TEXT;
