-- Proposta ganha campos do fluxo Geral/Conceito/Escopo/Cronograma/Investimento
ALTER TABLE "Proposta" ADD COLUMN "validade" TIMESTAMP(3);
ALTER TABLE "Proposta" ADD COLUMN "recorrente" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Proposta" ADD COLUMN "parcelamento" INTEGER;
ALTER TABLE "Proposta" ADD COLUMN "condicoesPagamento" TEXT;

-- Itens de escopo da proposta
CREATE TABLE "ItemEscopoProposta" (
    "id" TEXT NOT NULL,
    "propostaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "detalhe" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ItemEscopoProposta_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ItemEscopoProposta" ADD CONSTRAINT "ItemEscopoProposta_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Etapas do cronograma da proposta
CREATE TABLE "EtapaCronogramaProposta" (
    "id" TEXT NOT NULL,
    "propostaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "prazo" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "EtapaCronogramaProposta_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EtapaCronogramaProposta" ADD CONSTRAINT "EtapaCronogramaProposta_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
