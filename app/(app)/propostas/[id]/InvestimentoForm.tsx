"use client";

import { useState, useTransition } from "react";
import { updatePropostaInvestimento } from "../actions";

export function InvestimentoForm({
  propostaId,
  valor,
  validade,
  recorrente,
  parcelamento,
  condicoesPagamento,
}: {
  propostaId: string;
  valor: number | null;
  validade: Date | null;
  recorrente: boolean;
  parcelamento: number | null;
  condicoesPagamento: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [ehRecorrente, setEhRecorrente] = useState(recorrente);
  const validadeISO = validade ? validade.toISOString().slice(0, 10) : "";

  return (
    <form
      action={(formData) => startTransition(() => updatePropostaInvestimento(propostaId, formData))}
      className="card flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Valor {ehRecorrente ? "mensal" : "total"} (R$)</label>
          <input name="valor" type="number" step="0.01" defaultValue={valor ?? ""} className="input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Proposta válida até</label>
          <input name="validade" type="date" defaultValue={validadeISO} className="input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Parcelamento (em até Nx)</label>
          <input name="parcelamento" type="number" min={1} defaultValue={parcelamento ?? ""} className="input" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-muted">
          <input
            name="recorrente"
            type="checkbox"
            checked={ehRecorrente}
            onChange={(e) => setEhRecorrente(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          É um serviço recorrente (mensal)
        </label>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-muted">Condições de pagamento</label>
          <textarea
            name="condicoesPagamento"
            defaultValue={condicoesPagamento ?? ""}
            placeholder="Ex: 50% na aprovação, 50% na entrega"
            rows={2}
            className="input"
          />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
