"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { arquivarEmpresa } from "../actions";

export function ArquivarEmpresaButton({ id, arquivada }: { id: string; arquivada: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(() => arquivarEmpresa(id, !arquivada));
      }}
      title={arquivada ? "Reativar empresa" : "Arquivar empresa"}
      className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
    >
      {arquivada ? <ArchiveRestore size={14} /> : <Archive size={14} />}
    </button>
  );
}
