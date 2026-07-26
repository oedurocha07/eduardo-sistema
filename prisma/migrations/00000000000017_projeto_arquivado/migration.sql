-- Projeto pode ser arquivado ao finalizar
ALTER TABLE "Projeto" ADD COLUMN "arquivado" BOOLEAN NOT NULL DEFAULT false;
