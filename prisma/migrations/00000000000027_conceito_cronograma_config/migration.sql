ALTER TABLE "Proposta" RENAME COLUMN "conteudo" TO "contextoProjeto";
ALTER TABLE "Proposta" ADD COLUMN "fraseAbertura" TEXT;
ALTER TABLE "Proposta" ADD COLUMN "semCronograma" BOOLEAN NOT NULL DEFAULT false;
