"use client";

import { useTransition } from "react";
import { updatePropostaGeral } from "../actions";
import { ClienteSelect } from "@/app/components/comercial/ClienteSelect";

type Opcao = { id: string; label: string };

export function GeralForm({
  propostaId,
  titulo,
  alvoAtual,
  nomeManual,
  clientesRecorrentes,
  clientesFreela,
}: {
  propostaId: string;
  titulo: string;
  alvoAtual: string;
  nomeManual: string;
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
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Ou digite o nome do cliente (se ele ainda não estiver na base)</label>
        <input name="nomeManual" defaultValue={nomeManual} placeholder="Ex: João Silva" className="input" />
        <p className="text-xs text-muted">Só é usado se nenhum cliente for selecionado acima.</p>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
