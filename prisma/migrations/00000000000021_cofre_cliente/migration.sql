-- Cofre do cliente: dados de identidade/fiscais pra gerar e assinar contratos
CREATE TYPE "TipoPessoaCofre" AS ENUM ('FISICA', 'JURIDICA');

CREATE TABLE "CofreCliente" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPessoaCofre" NOT NULL DEFAULT 'JURIDICA',
    "nomeCompleto" TEXT NOT NULL,
    "apelido" TEXT,
    "cpfCnpj" TEXT,
    "responsavel" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "observacoes" TEXT,
    "clienteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CofreCliente_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CofreCliente_clienteId_key" ON "CofreCliente"("clienteId");
ALTER TABLE "CofreCliente" ADD CONSTRAINT "CofreCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Documento passa a poder pertencer a um cofre (contratos aninhados dentro do cofre)
ALTER TABLE "Documento" ADD COLUMN "cofreClienteId" TEXT;
ALTER TABLE "Documento" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_cofreClienteId_fkey" FOREIGN KEY ("cofreClienteId") REFERENCES "CofreCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
