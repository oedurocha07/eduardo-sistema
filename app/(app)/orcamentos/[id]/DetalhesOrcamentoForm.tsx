"use client";

import { useTransition } from "react";
import { updateOrcamentoDetalhes } from "../actions";
import { ClienteSelect } from "@/app/components/comercial/ClienteSelect";

type Opcao = { id: string; label: string };

export function DetalhesOrcamentoForm({
  orcamentoId,
  nome,
  alvoAtual,
  clientesRecorrentes,
  clientesFreela,
  dataPrevista,
  responsavel,
}: {
  orcamentoId: string;
  nome: string;
  alvoAtual: string;
  clientesRecorrentes: Opcao[];
  clientesFreela: Opcao[];
  dataPrevista: Date | null;
  responsavel: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const dataPrevistaISO = dataPrevista ? dataPrevista.toISOString().slice(0, 10) : "";

  return (
    <form
      action={(formData) => startTransition(() => updateOrcamentoDetalhes(orcamentoId, formData))}
      className="card flex flex-wrap items-end gap-3"
    >
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Cliente</label>
        <ClienteSelect defaultValue={alvoAtual} clientesRecorrentes={clientesRecorrentes} clientesFreela={clientesFreela} />
      </div>
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Nome do projeto</label>
        <input name="nome" defaultValue={nome} required className="input" />
      </div>
      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Data prevista</label>
        <input name="dataPrevista" type="date" defaultValue={dataPrevistaISO} className="input" />
      </div>
      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <label className="text-xs text-muted">Responsável</label>
        <input name="responsavel" defaultValue={responsavel ?? ""} placeholder="Você" className="input" />
      </div>
      <button type="submit" disabled={isPending} className="btn-secondary">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
