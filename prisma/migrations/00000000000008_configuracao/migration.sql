-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "metaMensal" DECIMAL(12,2),
    "superMetaMensal" DECIMAL(12,2),
    "atalhos" TEXT[] DEFAULT ARRAY['comercial', 'financeiro', 'projetos', 'performance']::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);
