-- AlterTable: Usuario ganha campos de reset de senha
ALTER TABLE "Usuario" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "resetTokenExp" TIMESTAMP(3);
