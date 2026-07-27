"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCliente } from "./actions";

export function DeleteClienteButton({ id, nome }: { id: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Apagar o cliente "${nome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(async () => {
            try {
              await deleteCliente(id);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erro ao apagar cliente");
            }
          });
        }
      }}
      title="Apagar cliente"
      className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-danger"
    >
      <Trash2 size={13} />
    </button>
  );
}
