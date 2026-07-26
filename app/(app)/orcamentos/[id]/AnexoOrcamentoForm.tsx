"use client";

import { useRef, useTransition } from "react";
import { Paperclip } from "lucide-react";
import { uploadArquivoOrcamento } from "../actions";

export function AnexoOrcamentoForm({ orcamentoId, arquivoUrl }: { orcamentoId: string; arquivoUrl: string | null }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="card">
      <h2 className="mb-2 font-semibold text-foreground">Anexo</h2>
      {arquivoUrl && (
        <a
          href={arquivoUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center gap-1.5 text-sm text-accent-hover hover:underline"
        >
          <Paperclip size={14} /> Ver anexo atual
        </a>
      )}
      <form
        ref={formRef}
        encType="multipart/form-data"
        action={(fd) => {
          startTransition(async () => {
            await uploadArquivoOrcamento(orcamentoId, fd);
            formRef.current?.reset();
          });
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input name="arquivo" type="file" required className="input flex-1" />
        <button type="submit" disabled={isPending} className="btn-secondary">
          {isPending ? "Enviando..." : "Anexar"}
        </button>
      </form>
    </div>
  );
}
