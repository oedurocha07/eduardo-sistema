"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteContato } from "../actions";

export function DeleteContatoButton({ id, nome }: { id: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar contato"
      onClick={() => {
        if (confirm(`Apagar o contato "${nome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(async () => {
            try {
              await deleteContato(id);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erro ao apagar contato");
            }
          });
        }
      }}
      className="text-muted hover:text-danger"
    >
      <Trash2 size={14} />
    </button>
  );
}
