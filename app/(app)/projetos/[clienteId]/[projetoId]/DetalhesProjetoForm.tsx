"use client";

import { useTransition } from "react";
import { updateProjetoDetalhes } from "../../actions";

export function DetalhesProjetoForm({
  projetoId,
  clienteId,
  valor,
  dataEntrega,
  briefing,
  areaClienteNotas,
}: {
  projetoId: string;
  clienteId: string;
  valor: number | null;
  dataEntrega: Date | null;
  briefing: string | null;
  areaClienteNotas: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const dataEntregaISO = dataEntrega ? dataEntrega.toISOString().slice(0, 10) : "";

  return (
    <form
      action={(formData) => startTransition(() => updateProjetoDetalhes(projetoId, clienteId, formData))}
      className="flex flex-col gap-4"
    >
      <div className="card">
        <h2 className="mb-3 font-semibold text-foreground">Informações</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Valor do projeto (R$)</label>
            <input name="valor" type="number" step="0.01" defaultValue={valor ?? ""} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Prazo de entrega</label>
            <input name="dataEntrega" type="date" defaultValue={dataEntregaISO} className="input" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-muted">Briefing / notas internas</label>
            <textarea name="briefing" defaultValue={briefing ?? ""} rows={4} className="input" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-1 font-semibold text-foreground">Área do cliente</h2>
        <p className="mb-3 text-xs text-muted">
          Notas e links voltados ao cliente (briefing compartilhado, links de aprovação, feedback). Só uso interno por
          enquanto — ainda não existe login separado para o cliente ver isso.
        </p>
        <textarea
          name="areaClienteNotas"
          defaultValue={areaClienteNotas ?? ""}
          rows={4}
          placeholder="Links de drive, aprovações, feedback do cliente..."
          className="input"
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
