"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { arquivarProjeto } from "../../actions";

export function ArquivarProjetoButton({
  id,
  clienteId,
  arquivado,
}: {
  id: string;
  clienteId: string;
  arquivado: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => arquivarProjeto(id, clienteId, !arquivado))}
      className="btn-secondary"
    >
      {arquivado ? <ArchiveRestore size={15} /> : <Archive size={15} />}
      {arquivado ? "Reativar projeto" : "Arquivar projeto"}
    </button>
  );
}
