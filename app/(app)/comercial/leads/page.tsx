import { prisma } from "@/app/lib/prisma";
import { ETAPAS } from "../constants";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { LeadRow } from "./LeadRow";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

const ETAPA_LABEL = Object.fromEntries(ETAPAS.map((e) => [e.value, e.label]));
const ETAPA_TONE: Record<string, "neutral" | "accent" | "success" | "danger" | "warning"> = {
  NOVO_LEAD: "neutral",
  DIAGNOSTICO: "accent",
  REUNIAO: "accent",
  PROPOSTA_ENVIADA: "accent",
  NEGOCIACAO: "warning",
  FECHADO: "success",
  PERDIDO: "danger",
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { empresa: true, contato: true, responsavel: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Leads" subtitle={`${leads.length} lead${leads.length === 1 ? "" : "s"} cadastrados`} />

      {leads.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum lead encontrado" description="Crie um lead na aba Jornada." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Resp.</th>
                <th className="px-4 py-3 font-medium">Temp.</th>
                <th className="px-4 py-3 font-medium">Próxima ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  id={lead.id}
                  empresaNome={lead.empresa.nome}
                  contatoNome={lead.contato.nome}
                  etapaLabel={ETAPA_LABEL[lead.etapa]}
                  etapaTone={ETAPA_TONE[lead.etapa]}
                  valorEstimado={lead.valorEstimado ? Number(lead.valorEstimado) : null}
                  responsavelNome={lead.responsavel?.nome ?? null}
                  temperatura={lead.temperatura}
                  proximaAcao={lead.proximaAcao}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
