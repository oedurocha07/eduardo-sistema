"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Trash2, LinkIcon, Paperclip, FileText } from "lucide-react";
import { createReferencia, deleteReferencia } from "../actions";

type Ref = { id: string; titulo: string; url: string | null; arquivoUrl: string | null };

export function ReferenciasSection({ eventoId, referencias }: { eventoId: string; referencias: Ref[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Referências</h2>
          <p className="text-sm text-muted">Briefings, mapas, roteiros, links e arquivos da operação.</p>
        </div>
        <button onClick={() => setAberto((v) => !v)} className="btn-primary">
          <Plus size={15} /> Referência
        </button>
      </div>

      {aberto && (
        <form
          ref={formRef}
          action={(fd) => {
            startTransition(async () => {
              await createReferencia(eventoId, fd);
              formRef.current?.reset();
              setAberto(false);
            });
          }}
          className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
        >
          <input name="titulo" placeholder="Título *" required className="input" autoFocus />
          <input name="url" placeholder="Link (opcional)" className="input flex-1" />
          <input name="arquivo" type="file" className="input" />
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar
          </button>
        </form>
      )}

      {referencias.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          Nenhuma referência ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {referencias.map((r) => {
            const href = r.url || r.arquivoUrl;
            return (
              <div key={r.id} className="card group flex items-center justify-between p-3">
                <a
                  href={href ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex min-w-0 items-center gap-2 ${href ? "hover:text-accent-hover" : "pointer-events-none"}`}
                >
                  {r.arquivoUrl ? <Paperclip size={14} className="shrink-0 text-muted" /> : r.url ? <LinkIcon size={14} className="shrink-0 text-muted" /> : <FileText size={14} className="shrink-0 text-muted" />}
                  <span className="truncate text-sm text-foreground">{r.titulo}</span>
                </a>
                <button onClick={() => startTransition(() => deleteReferencia(r.id, eventoId))} className="shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
