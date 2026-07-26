"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCofre } from "../actions";

export function DeleteCofreButton({ id, nome }: { id: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Apagar o cofre de "${nome}"? Isso também apaga os contratos anexados. Essa ação não pode ser desfeita.`)) {
          startTransition(() => deleteCofre(id));
        }
      }}
      className="btn-secondary text-danger"
    >
      <Trash2 size={15} />
      Apagar cofre
    </button>
  );
}
