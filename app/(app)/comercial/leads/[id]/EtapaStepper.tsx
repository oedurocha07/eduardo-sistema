"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { EtapaLead } from "@/app/generated/prisma/client";
import { ETAPAS } from "@/app/(app)/comercial/constants";
import { updateLeadEtapa } from "@/app/(app)/comercial/actions";

const PASSOS = ETAPAS.filter((et) => et.value !== "PERDIDO");

export function EtapaStepper({
  leadId,
  etapa,
  onChanged,
}: {
  leadId: string;
  etapa: EtapaLead;
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const indexAtual = PASSOS.findIndex((p) => p.value === etapa);
  const perdido = etapa === "PERDIDO";

  return (
    <div className={`flex items-center ${isPending ? "opacity-60" : ""}`}>
      {PASSOS.map((passo, i) => {
        const concluido = !perdido && i < indexAtual;
        const atual = !perdido && i === indexAtual;
        return (
          <div key={passo.value} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(async () => { await updateLeadEtapa(leadId, passo.value); onChanged?.(); })}
              className="flex flex-col items-center gap-1.5"
              title={passo.label}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                  concluido
                    ? "border-accent bg-accent text-accent-foreground"
                    : atual
                      ? "border-accent bg-transparent text-accent-hover"
                      : "border-border bg-surface text-muted"
                }`}
              >
                {concluido ? <Check size={13} /> : i + 1}
              </span>
              <span className={`text-center text-[10px] leading-tight sm:text-[11px] sm:whitespace-nowrap ${atual ? "text-foreground" : "text-muted"}`}>
                {passo.label}
              </span>
            </button>
            {i < PASSOS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${concluido ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
