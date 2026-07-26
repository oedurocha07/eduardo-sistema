"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createEtapaCronograma, deleteEtapaCronograma } from "../actions";

type Etapa = { id: string; titulo: string; prazo: string | null };

export function CronogramaSection({ propostaId, etapas }: { propostaId: string; etapas: Etapa[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Cronograma</h2>
        <span className="text-xs text-muted">{etapas.length} etapa(s)</span>
      </div>

      {etapas.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma etapa definida ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {etapas.map((etapa) => (
            <div key={etapa.id} className="group flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground">{etapa.titulo}</span>
              <div className="flex items-center gap-2">
                {etapa.prazo && <span className="text-xs text-muted">{etapa.prazo}</span>}
                <button
                  onClick={() => startTransition(() => deleteEtapaCronograma(etapa.id, propostaId))}
                  className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aberto ? (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createEtapaCronograma(propostaId, fd);
              setAberto(false);
            });
          }}
          className="mt-2 flex flex-wrap gap-2"
        >
          <input name="titulo" placeholder="Ex: Captação audiovisual" required className="input flex-1 !py-1 text-xs" autoFocus />
          <input name="prazo" placeholder="Ex: Semana 3" className="input w-32 !py-1 text-xs" />
          <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
            Add
          </button>
        </form>
      ) : (
        <button onClick={() => setAberto(true)} className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline">
          <Plus size={12} /> Adicionar etapa
        </button>
      )}
    </div>
  );
}
