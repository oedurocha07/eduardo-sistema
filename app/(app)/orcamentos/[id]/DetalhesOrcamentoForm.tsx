"use client";

import { useTransition } from "react";
import { updateOrcamentoDetalhes } from "../actions";

type Opcao = { id: string; label: string };

export function DetalhesOrcamentoForm({
  orcamentoId,
  nome,
  alvoAtual,
  leads,
  clientes,
}: {
  orcamentoId: string;
  nome: string;
  alvoAtual: string;
  leads: Opcao[];
  clientes: Opcao[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updateOrcamentoDetalhes(orcamentoId, formData))}
      className="card flex flex-wrap items-end gap-3"
    >
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Nome do projeto</label>
        <input name="nome" defaultValue={nome} required className="input" />
      </div>
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Cliente</label>
        <select name="alvo" defaultValue={alvoAtual} className="input">
          <option value="">Sem vínculo</option>
          {leads.length > 0 && (
            <optgroup label="Leads">
              {leads.map((l) => (
                <option key={l.id} value={`lead:${l.id}`}>
                  {l.label}
                </option>
              ))}
            </optgroup>
          )}
          {clientes.length > 0 && (
            <optgroup label="Clientes">
              {clientes.map((c) => (
                <option key={c.id} value={`cliente:${c.id}`}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      <button type="submit" disabled={isPending} className="btn-secondary">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
