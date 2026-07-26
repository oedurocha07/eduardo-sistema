"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { createMembroProjeto, deleteMembroProjeto } from "../../actions";
import { FUNCOES_EQUIPE } from "@/app/(app)/eventos/constants";

type Membro = { id: string; nome: string; funcao: string; cache: number | null; contato: string | null };

export function EquipeProjetoSection({
  projetoId,
  clienteId,
  membros,
}: {
  projetoId: string;
  clienteId: string;
  membros: Membro[];
}) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalCache = membros.reduce((s, m) => s + (m.cache ?? 0), 0);

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Equipe</h2>
        {totalCache > 0 && (
          <span className="text-xs text-muted">
            Cachês: <Money value={totalCache} />
          </span>
        )}
      </div>

      {membros.length === 0 ? (
        <p className="text-sm text-muted">Ninguém escalado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {membros.map((m) => (
            <div key={m.id} className="group flex items-center justify-between text-sm">
              <div className="min-w-0">
                <span className="font-medium text-foreground">{m.nome}</span>
                <span className="text-muted"> · {m.funcao}</span>
                {m.contato && <span className="text-muted"> · {m.contato}</span>}
              </div>
              <div className="flex items-center gap-2">
                {m.cache != null && <Money value={m.cache} className="text-xs text-muted" />}
                <button
                  onClick={() => startTransition(() => deleteMembroProjeto(m.id, clienteId, projetoId))}
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
              await createMembroProjeto(projetoId, clienteId, fd);
              setAberto(false);
            });
          }}
          className="mt-2 grid grid-cols-2 gap-2"
        >
          <input name="nome" placeholder="Nome *" required className="input !py-1 text-xs" autoFocus />
          <input name="funcao" list="funcoes-projeto" placeholder="Função *" required className="input !py-1 text-xs" />
          <datalist id="funcoes-projeto">
            {FUNCOES_EQUIPE.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <input name="cache" type="number" step="0.01" placeholder="Cachê (R$)" className="input !py-1 text-xs" />
          <input name="contato" placeholder="Contato" className="input !py-1 text-xs" />
          <button type="submit" className="btn-primary col-span-2 !py-1 text-xs">
            Adicionar
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline"
        >
          <Plus size={12} /> Adicionar membro
        </button>
      )}
    </div>
  );
}
