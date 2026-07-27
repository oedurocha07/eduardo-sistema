"use client";

import { useEffect, useState, useTransition } from "react";
import { CircleCheck, Package, Plus, Trash2 } from "lucide-react";
import { createItemEscopo, deleteItemEscopo, updateItemEscopo } from "../actions";

type Item = { id: string; titulo: string; detalhe: string | null; custoInterno: number | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ItemEscopoCard({ propostaId, item }: { propostaId: string; item: Item }) {
  const [titulo, setTitulo] = useState(item.titulo);
  const [detalhe, setDetalhe] = useState(item.detalhe ?? "");
  const [custoInterno, setCustoInterno] = useState(item.custoInterno != null ? String(item.custoInterno) : "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => setTitulo(item.titulo), [item.titulo]);
  useEffect(() => setDetalhe(item.detalhe ?? ""), [item.detalhe]);
  useEffect(() => setCustoInterno(item.custoInterno != null ? String(item.custoInterno) : ""), [item.custoInterno]);

  function salvar() {
    if (!titulo.trim()) return;
    startTransition(() => updateItemEscopo(item.id, propostaId, titulo, detalhe, custoInterno ? Number(custoInterno) : null));
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <CircleCheck size={20} className="shrink-0 text-green-600" strokeWidth={1.75} />
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
        <Package size={14} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvar}
          disabled={isPending}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
        />
        <input
          value={detalhe}
          onChange={(e) => setDetalhe(e.target.value)}
          onBlur={salvar}
          disabled={isPending}
          placeholder="Detalhe (opcional)"
          className="w-full bg-transparent text-xs text-muted outline-none placeholder:text-muted/60"
        />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-muted">Custo interno</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted">R$</span>
          <input
            value={custoInterno}
            onChange={(e) => setCustoInterno(e.target.value)}
            onBlur={salvar}
            disabled={isPending}
            type="number"
            step="0.01"
            className="input w-24 !py-1 text-right text-xs"
          />
        </div>
      </div>
      <button
        onClick={() => startTransition(() => deleteItemEscopo(item.id, propostaId))}
        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function EscopoSection({ propostaId, itens }: { propostaId: string; itens: Item[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const custoTotal = itens.reduce((soma, item) => soma + (item.custoInterno ?? 0), 0);

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Escolha o escopo</h2>
        <p className="text-xs text-muted">
          O que está incluído no projeto. Custo interno é só pra você — nunca aparece pro cliente.
        </p>
      </div>

      {itens.length === 0 ? (
        <p className="text-sm text-muted">Nenhum item ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {itens.map((item) => (
            <ItemEscopoCard key={item.id} propostaId={propostaId} item={item} />
          ))}
        </div>
      )}

      {custoTotal > 0 && (
        <p className="mt-3 text-xs text-muted">
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
          className="mt-3 flex flex-wrap gap-2"
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
        <button onClick={() => setAberto(true)} className="mt-3 flex items-center gap-1 text-xs text-accent-hover hover:underline">
          <Plus size={12} /> Adicionar item
        </button>
      )}
    </div>
  );
}
