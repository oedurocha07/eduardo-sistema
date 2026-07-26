"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { useLeadPopup } from "./LeadPopupContext";
import { getLeadResumo } from "./actions";
import { EtapaStepper } from "./leads/[id]/EtapaStepper";
import { TemperaturaToggle } from "./leads/[id]/TemperaturaToggle";
import { ProximaAcaoForm } from "./leads/[id]/ProximaAcaoForm";
import { DetalhesForm } from "./leads/[id]/DetalhesForm";
import { TimelineSection } from "./leads/[id]/TimelineSection";

type Resumo = NonNullable<Awaited<ReturnType<typeof getLeadResumo>>>;

export function LeadPopup() {
  const { leadId, fecharLead } = useLeadPopup();
  const [resumo, setResumo] = useState<Resumo | null>(null);

  const recarregar = useCallback(() => {
    if (!leadId) return;
    getLeadResumo(leadId).then((r) => setResumo(r));
  }, [leadId]);

  useEffect(() => {
    setResumo(null);
    if (leadId) recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={fecharLead} />
      <div className="card relative z-10 max-h-[90vh] w-full max-w-2xl gap-0 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">{resumo?.empresaNome ?? "Carregando..."}</h2>
          <div className="flex items-center gap-3">
            <Link
              href={`/comercial/leads/${leadId}`}
              onClick={fecharLead}
              className="flex items-center gap-1 text-xs text-accent-hover hover:underline"
            >
              Página completa <ExternalLink size={12} />
            </Link>
            <button onClick={fecharLead} className="text-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        </div>

        {!resumo ? (
          <p className="text-sm text-muted">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-5">
            <EtapaStepper leadId={resumo.id} etapa={resumo.etapa} onChanged={recarregar} />

            <TemperaturaToggle leadId={resumo.id} temperatura={resumo.temperatura} onChanged={recarregar} />

            <ProximaAcaoForm
              leadId={resumo.id}
              proximaAcao={resumo.proximaAcao}
              proximaAcaoEm={resumo.proximaAcaoEm}
              onChanged={recarregar}
            />

            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted uppercase">Contato</h3>
              <p className="text-sm text-foreground">
                {resumo.contatoNome}
                {resumo.contatoCargo && ` · ${resumo.contatoCargo}`}
              </p>
              <p className="text-sm text-muted">
                {resumo.contatoEmail ?? "—"}
                {resumo.contatoTelefone && ` · ${resumo.contatoTelefone}`}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted uppercase">Detalhes</h3>
              <DetalhesForm
                leadId={resumo.id}
                empresaNome={resumo.empresaNome}
                valorEstimado={resumo.valorEstimado}
                origem={resumo.origem}
                responsavelId={resumo.responsavelId}
                usuarios={resumo.usuarios}
                onChanged={recarregar}
              />
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted uppercase">Timeline</h3>
              <TimelineSection leadId={resumo.id} atividades={resumo.atividades} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
