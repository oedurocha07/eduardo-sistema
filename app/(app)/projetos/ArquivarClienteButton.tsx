"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { arquivarCliente } from "./actions";

export function ArquivarClienteButton({ id, ativo }: { id: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        startTransition(() => arquivarCliente(id, !ativo));
      }}
      title={ativo ? "Arquivar cliente" : "Reativar cliente"}
      className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
    >
      {ativo ? <Archive size={13} /> : <ArchiveRestore size={13} />}
    </button>
  );
}
