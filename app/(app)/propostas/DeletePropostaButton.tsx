"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProposta } from "./actions";

export function DeletePropostaButton({ id, titulo }: { id: string; titulo: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar proposta"
      onClick={() => {
        if (confirm(`Apagar a proposta "${titulo}"? Essa ação não pode ser desfeita.`)) {
          startTransition(() => deleteProposta(id));
        }
      }}
      className="btn-secondary text-danger"
    >
      <Trash2 size={15} />
      Apagar
    </button>
  );
}
