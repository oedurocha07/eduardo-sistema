-- AlterTable
ALTER TABLE "ClienteRecorrente"
ADD COLUMN "cep" TEXT,
ADD COLUMN "logradouro" TEXT,
ADD COLUMN "numero" TEXT,
ADD COLUMN "complemento" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cidade" TEXT,
ADD COLUMN "uf" TEXT;

-- Preserva o valor existente de "endereco" (que já era só o CEP) na nova coluna "cep"
UPDATE "ClienteRecorrente" SET "cep" = "endereco" WHERE "endereco" IS NOT NULL;

ALTER TABLE "ClienteRecorrente" DROP COLUMN "endereco";
