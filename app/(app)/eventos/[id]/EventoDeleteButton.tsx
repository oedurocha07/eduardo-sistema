"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvento } from "../actions";

export function EventoDeleteButton({ id }: { id: string }) {
  const [confirmar, setConfirmar] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirmar) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Excluir?</span>
        <button
          onClick={() => startTransition(() => deleteEvento(id))}
          disabled={isPending}
          className="btn-danger !px-3 !py-1.5 text-sm"
        >
          Confirmar
        </button>
        <button onClick={() => setConfirmar(false)} className="btn-ghost !px-3 !py-1.5 text-sm">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirmar(true)} className="btn-ghost !p-2" title="Excluir evento">
      <Trash2 size={16} />
    </button>
  );
}
