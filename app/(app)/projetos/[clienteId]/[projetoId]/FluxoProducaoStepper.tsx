"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { updateProjetoStatus } from "../../actions";
import { ETAPAS_PRODUCAO } from "../../constants";
import { EtapaProducao } from "@/app/generated/prisma/client";

export function FluxoProducaoStepper({ projetoId, status }: { projetoId: string; status: EtapaProducao }) {
  const [isPending, startTransition] = useTransition();
  const indiceAtual = ETAPAS_PRODUCAO.findIndex((e) => e.value === status);

  return (
    <div className="card">
      <h2 className="mb-4 font-semibold text-foreground">Fluxo de produção</h2>
      <div className="flex flex-wrap items-center gap-1">
        {ETAPAS_PRODUCAO.map((etapa, i) => {
          const concluida = i < indiceAtual;
          const atual = i === indiceAtual;
          return (
            <div key={etapa.value} className="flex items-center gap-1">
              <button
                type="button"
                disabled={isPending || atual}
                onClick={() => startTransition(() => updateProjetoStatus(projetoId, etapa.value))}
                title={etapa.label}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  atual
                    ? "border-accent bg-accent/15 text-accent-hover"
                    : concluida
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border text-muted hover:text-foreground"
                }`}
              >
                {concluida && <Check size={11} />}
                {etapa.label}
              </button>
              {i < ETAPAS_PRODUCAO.length - 1 && <div className="h-px w-3 bg-border" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
