"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createItemEscopo, deleteItemEscopo } from "../actions";

type Item = { id: string; titulo: string; detalhe: string | null; custoInterno: number | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function EscopoSection({ propostaId, itens }: { propostaId: string; itens: Item[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const custoTotal = itens.reduce((soma, item) => soma + (item.custoInterno ?? 0), 0);

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Escopo</h2>
          <p className="text-xs text-muted">
            O que está incluído no projeto. O custo interno é só pra você — nunca aparece pro cliente.
          </p>
        </div>
        <span className="text-xs text-muted">{itens.length} item(ns)</span>
      </div>

      {itens.length === 0 ? (
        <p className="text-sm text-muted">Nenhum item ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {itens.map((item) => (
            <div key={item.id} className="group flex items-start justify-between gap-2 text-sm">
              <div>
                <span className="font-medium text-foreground">{item.titulo}</span>
                {item.detalhe && <span className="text-muted"> — {item.detalhe}</span>}
                {item.custoInterno != null && (
                  <span className="ml-2 text-xs text-muted">custo interno: {brl(item.custoInterno)}</span>
                )}
              </div>
              <button
                onClick={() => startTransition(() => deleteItemEscopo(item.id, propostaId))}
                className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {custoTotal > 0 && (
        <p className="mt-2 text-xs text-muted">
          Custo operacional total: <span className="font-medium text-foreground">{brl(custoTotal)}</span>
        </p>
      )}

      {aberto ? (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createItemEscopo(propostaId, fd);
              setAberto(false);
            });
          }}
          className="mt-2 flex flex-wrap gap-2"
        >
          <input name="titulo" placeholder="Ex: Captação em vídeo" required className="input flex-1 !py-1 text-xs" autoFocus />
          <input name="detalhe" placeholder="Detalhe (opcional)" className="input flex-1 !py-1 text-xs" />
          <input
            name="custoInterno"
            type="number"
            step="0.01"
            placeholder="Custo interno (opcional)"
            className="input w-40 !py-1 text-xs"
          />
          <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
            Add
          </button>
        </form>
      ) : (
        <button onClick={() => setAberto(true)} className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline">
          <Plus size={12} /> Adicionar item
        </button>
      )}
    </div>
  );
}
