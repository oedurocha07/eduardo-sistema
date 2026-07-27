-- Reduz EtapaLead de 7 pra 5 valores (remove DIAGNOSTICO e NEGOCIACAO, não usados)
BEGIN;
CREATE TYPE "EtapaLead_new" AS ENUM ('NOVO_LEAD', 'REUNIAO', 'PROPOSTA_ENVIADA', 'FECHADO', 'PERDIDO');
ALTER TABLE "Lead" ALTER COLUMN "etapa" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "etapa" TYPE "EtapaLead_new" USING ("etapa"::text::"EtapaLead_new");
ALTER TYPE "EtapaLead" RENAME TO "EtapaLead_old";
ALTER TYPE "EtapaLead_new" RENAME TO "EtapaLead";
DROP TYPE "EtapaLead_old";
ALTER TABLE "Lead" ALTER COLUMN "etapa" SET DEFAULT 'NOVO_LEAD';
COMMIT;

-- AlterTable
ALTER TABLE "ClienteRecorrente" ADD COLUMN "recorrente" BOOLEAN NOT NULL DEFAULT true;
