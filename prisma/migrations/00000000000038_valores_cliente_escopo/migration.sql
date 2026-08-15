-- AlterTable
ALTER TABLE "ItemEscopoProposta" ADD COLUMN "valorCliente" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN "mostrarValoresItens" BOOLEAN NOT NULL DEFAULT false;
