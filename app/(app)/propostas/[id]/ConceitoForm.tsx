"use client";

import { useTransition } from "react";
import { updatePropostaConceito } from "../actions";

export function ConceitoForm({ propostaId, conteudo }: { propostaId: string; conteudo: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updatePropostaConceito(propostaId, formData))}
      className="card flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Conceito / contexto da proposta</label>
        <p className="mb-1 text-xs text-muted">
          O ponto de partida: qual o objetivo do projeto e por que essa é a solução certa para o cliente.
        </p>
        <textarea name="conteudo" defaultValue={conteudo ?? ""} rows={8} className="input" />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
