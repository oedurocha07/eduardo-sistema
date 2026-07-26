"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvento } from "./actions";

export function DeleteEventoButton({ id, titulo }: { id: string; titulo: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar evento"
      onClick={() => {
        if (confirm(`Apagar o evento "${titulo}"?`)) {
          startTransition(() => deleteEvento(id));
        }
      }}
      className="text-muted hover:text-danger"
    >
      <Trash2 size={14} />
    </button>
  );
}
