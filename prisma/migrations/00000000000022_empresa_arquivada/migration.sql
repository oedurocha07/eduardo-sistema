-- Empresa pode ser arquivada (marcada como inativa, sem excluir)
ALTER TABLE "Empresa" ADD COLUMN "arquivada" BOOLEAN NOT NULL DEFAULT false;
