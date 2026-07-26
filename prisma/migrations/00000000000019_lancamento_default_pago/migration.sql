-- Novo lançamento já nasce como Pago (Eduardo pediu: tudo que ele lança já é pago)
ALTER TABLE "Lancamento" ALTER COLUMN "status" SET DEFAULT 'PAGO';
