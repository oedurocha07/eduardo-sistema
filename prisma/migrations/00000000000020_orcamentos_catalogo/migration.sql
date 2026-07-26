-- Orcamento reestruturado (so tinha 1 registro de teste, removido antes de alterar colunas)
DELETE FROM "Orcamento";

ALTER TABLE "Orcamento" DROP COLUMN "tipo";
ALTER TABLE "Orcamento" DROP COLUMN "descricao";
ALTER TABLE "Orcamento" DROP COLUMN "custoEstimado";
ALTER TABLE "Orcamento" DROP COLUMN "precoEstimado";
ALTER TABLE "Orcamento" DROP COLUMN "lucroEstimado";

ALTER TABLE "Orcamento" ADD COLUMN "nome" TEXT NOT NULL;
ALTER TABLE "Orcamento" ADD COLUMN "categoria" TEXT NOT NULL;
ALTER TABLE "Orcamento" ADD COLUMN "leadId" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN "clienteId" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN "margemPercentual" DECIMAL(5,2) NOT NULL DEFAULT 40;
ALTER TABLE "Orcamento" ADD COLUMN "mostrarDetalhado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Orcamento" ADD COLUMN "isTemplate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Orcamento" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Catalogo global de itens/precos (compartilhado entre Orcamentos e futuramente Propostas)
CREATE TABLE "ItemCatalogo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "precoBase" DECIMAL(12,2) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemCatalogo_pkey" PRIMARY KEY ("id")
);

-- Itens de um orcamento especifico (snapshot de nome/preco no momento)
CREATE TABLE "ItemOrcamento" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "itemCatalogoId" TEXT,
    "nome" TEXT NOT NULL,
    "custoUnitario" DECIMAL(12,2) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ItemOrcamento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_itemCatalogoId_fkey" FOREIGN KEY ("itemCatalogoId") REFERENCES "ItemCatalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Catalogo inicial com a precificacao oficial (modelo enxuto, decisao de 13/07/2026)
-- Valores com faixa no documento mestre (ex: R$900-1.100) foram semeados no meio da faixa,
-- ajustaveis depois em Configuracao de precos.
INSERT INTO "ItemCatalogo" (id, nome, categoria, unidade, "precoBase", ordem) VALUES
  (gen_random_uuid()::text, 'Diária Diretor/Filmmaker', 'Equipe', 'diária', 1000.00, 0),
  (gen_random_uuid()::text, 'Edição simples', 'Pós-produção', 'peça', 120.00, 1),
  (gen_random_uuid()::text, 'Edição complexa', 'Pós-produção', 'peça', 180.00, 2),
  (gen_random_uuid()::text, 'After Movie', 'Pós-produção', 'peça', 400.00, 3),
  (gen_random_uuid()::text, 'Same Day (terceirizado)', 'Equipe', 'diária', 500.00, 4),
  (gen_random_uuid()::text, 'Alimentação', 'Custos operacionais', 'diária', 60.00, 5),
  (gen_random_uuid()::text, 'Deslocamento', 'Custos operacionais', 'diária', 80.00, 6);
