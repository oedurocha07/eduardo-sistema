"use client";

import { useTransition } from "react";
import { updatePropostaGeral } from "../actions";
import { ClienteSelect } from "@/app/components/comercial/ClienteSelect";

type Opcao = { id: string; label: string };

export function GeralForm({
  propostaId,
  titulo,
  alvoAtual,
  clientesRecorrentes,
  clientesFreela,
}: {
  propostaId: string;
  titulo: string;
  alvoAtual: string;
  clientesRecorrentes: Opcao[];
  clientesFreela: Opcao[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updatePropostaGeral(propostaId, formData))}
      className="card flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Nome do projeto</label>
        <input name="titulo" defaultValue={titulo} required className="input" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Cliente</label>
        <ClienteSelect
          defaultValue={alvoAtual}
          clientesRecorrentes={clientesRecorrentes}
          clientesFreela={clientesFreela}
        />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
