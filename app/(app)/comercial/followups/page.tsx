import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { LimparProximaAcaoButton } from "../LimparProximaAcaoButton";
import { BellRing } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const leads = await prisma.lead.findMany({
    where: { proximaAcao: { not: null } },
    include: { empresa: true, contato: true },
    orderBy: { proximaAcaoEm: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Follow-ups" />

      {leads.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Nenhum follow-up pendente"
          description="Cadastre leads e defina a próxima ação para acompanhar tudo aqui."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <div key={lead.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{lead.empresa.nome}</div>
                <div className="text-sm text-muted">{lead.contato.nome}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-foreground">{lead.proximaAcao}</div>
                  {lead.proximaAcaoEm && (
                    <div className="text-xs text-muted">{lead.proximaAcaoEm.toLocaleDateString("pt-BR")}</div>
                  )}
                </div>
                <LimparProximaAcaoButton leadId={lead.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
