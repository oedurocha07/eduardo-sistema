"use client";

import { useTransition } from "react";
import { FileText, Bookmark, FolderKanban, Copy, Trash2 } from "lucide-react";
import {
  gerarPropostaDoOrcamento,
  salvarComoTemplate,
  criarProjetoDoOrcamento,
  duplicarOrcamento,
  deleteOrcamento,
} from "../actions";

export function AcoesOrcamento({
  orcamentoId,
  temCliente,
  isTemplate,
}: {
  orcamentoId: string;
  temCliente: boolean;
  isTemplate: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card flex flex-wrap gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => gerarPropostaDoOrcamento(orcamentoId))}
        className="btn-primary"
      >
        <FileText size={15} /> Gerar proposta
      </button>
      <button
        disabled={isPending || isTemplate}
        onClick={() => startTransition(() => salvarComoTemplate(orcamentoId))}
        className="btn-secondary"
      >
        <Bookmark size={15} /> {isTemplate ? "Já é template" : "Salvar como template"}
      </button>
      <button
        disabled={isPending || !temCliente}
        title={!temCliente ? "Vincule um cliente antes" : undefined}
        onClick={() => startTransition(() => criarProjetoDoOrcamento(orcamentoId))}
        className="btn-secondary"
      >
        <FolderKanban size={15} /> Criar projeto
      </button>
      <button disabled={isPending} onClick={() => startTransition(() => duplicarOrcamento(orcamentoId))} className="btn-secondary">
        <Copy size={15} /> Duplicar
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Apagar este orçamento? Essa ação não pode ser desfeita.")) {
            startTransition(() => deleteOrcamento(orcamentoId));
          }
        }}
        className="btn-secondary ml-auto text-danger"
      >
        <Trash2 size={15} /> Apagar
      </button>
    </div>
  );
}
