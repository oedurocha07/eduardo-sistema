"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLancamento } from "../actions";

export function DeleteLancamentoButton({ id, descricao }: { id: string; descricao: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar lançamento"
      onClick={() => {
        if (confirm(`Apagar o lançamento "${descricao}"? Essa ação não pode ser desfeita.`)) {
          startTransition(() => deleteLancamento(id));
        }
      }}
      className="rounded-md bg-surface p-1.5 text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
    >
      <Trash2 size={13} />
    </button>
  );
}
