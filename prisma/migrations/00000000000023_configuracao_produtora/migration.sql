-- Nome e logo da produtora, configuraveis (antes hardcoded como "Avra Produtora LTDA")
ALTER TABLE "Configuracao" ADD COLUMN "nomeProdutora" TEXT;
ALTER TABLE "Configuracao" ADD COLUMN "logoUrl" TEXT;
