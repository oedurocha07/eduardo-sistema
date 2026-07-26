"use client";

import { useState, useTransition } from "react";
import { Money } from "@/app/components/ui/Money";
import { updateMargem, toggleMostrarDetalhado } from "../actions";

export function FormacaoPrecoCard({
  orcamentoId,
  custoOperacional,
  margemPercentual,
  mostrarDetalhado,
}: {
  orcamentoId: string;
  custoOperacional: number;
  margemPercentual: number;
  mostrarDetalhado: boolean;
}) {
  const [margem, setMargem] = useState(margemPercentual);
  const [isPending, startTransition] = useTransition();

  const margemFrac = margem / 100;
  const precoSugerido = margemFrac < 1 ? custoOperacional / (1 - margemFrac) : custoOperacional;
  const lucroEstimado = precoSugerido - custoOperacional;

  return (
    <div className="card">
      <h2 className="mb-3 font-semibold text-foreground">Formação do preço</h2>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-muted uppercase">Custo operacional</div>
          <div className="text-lg font-bold text-foreground">
            <Money value={custoOperacional} />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted uppercase">Preço sugerido</div>
          <div className="text-lg font-bold text-accent-hover">
            <Money value={precoSugerido} />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted uppercase">Lucro estimado</div>
          <div className="text-lg font-bold text-success">
            <Money value={lucroEstimado} />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted">Margem desejada</span>
          <span className="font-medium text-foreground">{margem}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={margem}
          disabled={isPending}
          onChange={(e) => setMargem(Number(e.target.value))}
          onMouseUp={() => startTransition(() => updateMargem(orcamentoId, margem))}
          onTouchEnd={() => startTransition(() => updateMargem(orcamentoId, margem))}
          className="w-full accent-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={mostrarDetalhado}
          disabled={isPending}
          onChange={(e) => startTransition(() => toggleMostrarDetalhado(orcamentoId, e.target.checked))}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Detalhar valores por item na proposta (em vez de só o total)
      </label>
    </div>
  );
}
