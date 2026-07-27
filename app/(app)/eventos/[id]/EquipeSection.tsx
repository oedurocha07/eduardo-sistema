"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { createMembro, deleteMembro } from "../actions";
import { FUNCOES_EQUIPE } from "../constants";

type Membro = { id: string; nome: string; funcao: string; diaISO: string | null; cache: number | null; contato: string | null };

export function EquipeSection({ eventoId, membros }: { eventoId: string; membros: Membro[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const funcoes = Array.from(new Set(membros.map((m) => m.funcao)));
  const totalCache = membros.reduce((s, m) => s + (m.cache ?? 0), 0);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Equipe por função</h2>
          <p className="text-sm text-muted">Escale a equipe e acompanhe os cachês.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted uppercase">Cachês</div>
            <div className="font-semibold text-foreground"><Money value={totalCache} /></div>
          </div>
          <button onClick={() => setAberto((v) => !v)} className="btn-primary">
            <Plus size={15} /> Membro
          </button>
        </div>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createMembro(eventoId, fd);
              setAberto(false);
            });
          }}
          className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-border p-3 md:grid-cols-4"
        >
          <input name="nome" placeholder="Nome *" required className="input" autoFocus />
          <input name="funcao" list="funcoes" placeholder="Função *" required className="input" />
          <datalist id="funcoes">
            {FUNCOES_EQUIPE.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <input name="dia" type="date" className="input" />
          <input name="cache" type="number" step="0.01" placeholder="Cachê (R$)" className="input" />
          <input name="contato" placeholder="Contato" className="input col-span-2 md:col-span-3" />
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar
          </button>
        </form>
      )}

      {membros.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          Nenhum membro na equipe ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {funcoes.map((funcao) => (
            <div key={funcao}>
              <h3 className="mb-2 text-xs font-semibold text-muted uppercase">{funcao}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {membros.filter((m) => m.funcao === funcao).map((m) => (
                  <div key={m.id} className="card group flex items-start justify-between p-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{m.nome}</div>
                      <div className="text-xs text-muted">
                        {m.diaISO && new Date(m.diaISO).toLocaleDateString("pt-BR")}
                        {m.contato && <> · {m.contato}</>}
                      </div>
                      {m.cache != null && (
                        <div className="mt-0.5 text-xs text-success">
                          <Money value={m.cache} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => startTransition(() => deleteMembro(m.id, eventoId))}
                      className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
