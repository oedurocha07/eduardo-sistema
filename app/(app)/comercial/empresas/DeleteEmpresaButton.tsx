"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEmpresa } from "../actions";

export function DeleteEmpresaButton({ id, nome }: { id: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar empresa"
      onClick={(e) => {
        e.stopPropagation();
        if (confirm(`Apagar a empresa "${nome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(async () => {
            try {
              await deleteEmpresa(id);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erro ao apagar empresa");
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
