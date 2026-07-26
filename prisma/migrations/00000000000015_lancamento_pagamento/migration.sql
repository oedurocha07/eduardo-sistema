-- Lancamento ganha forma de pagamento e comprovante anexado
ALTER TABLE "Lancamento" ADD COLUMN "formaPagamento" TEXT;
ALTER TABLE "Lancamento" ADD COLUMN "comprovanteUrl" TEXT;
