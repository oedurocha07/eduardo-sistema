"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { addItemDoCatalogo, addItemAvulso, updateItemOrcamentoQuantidade, deleteItemOrcamento } from "../actions";

type Item = { id: string; nome: string; custoUnitario: number; quantidade: number };
type ItemCatalogo = { id: string; nome: string; categoria: string; unidade: string; precoBase: number };

function LinhaItem({ item, orcamentoId }: { item: Item; orcamentoId: string }) {
  const [quantidade, setQuantidade] = useState(item.quantidade);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <span className="font-medium text-foreground">{item.nome}</span>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={quantidade}
          disabled={isPending}
          onChange={(e) => {
            const v = Number(e.target.value) || 1;
            setQuantidade(v);
          }}
          onBlur={() => startTransition(() => updateItemOrcamentoQuantidade(item.id, orcamentoId, quantidade))}
          className="input w-16 !py-1 text-xs"
        />
        <Money value={item.custoUnitario * quantidade} className="w-24 text-right text-muted" />
        <button
          onClick={() => startTransition(() => deleteItemOrcamento(item.id, orcamentoId))}
          className="text-muted hover:text-danger"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function ItensOrcamentoSection({
  orcamentoId,
  itens,
  catalogo,
}: {
  orcamentoId: string;
  itens: Item[];
  catalogo: ItemCatalogo[];
}) {
  const [itemCatalogoId, setItemCatalogoId] = useState("");
  const [avulsoAberto, setAvulsoAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card">
      <h2 className="mb-1 font-semibold text-foreground">Escopo</h2>
      <p className="mb-3 text-xs text-muted">Escolha os itens do catálogo ou adicione um item avulso.</p>

      {itens.length === 0 ? (
        <p className="mb-3 text-sm text-muted">Nenhum item ainda.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-1.5">
          {itens.map((item) => (
            <LinhaItem key={item.id} item={item} orcamentoId={orcamentoId} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select value={itemCatalogoId} onChange={(e) => setItemCatalogoId(e.target.value)} className="input flex-1">
          <option value="">Escolher item do catálogo...</option>
          {catalogo.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} — R$ {c.precoBase.toLocaleString("pt-BR")} / {c.unidade}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!itemCatalogoId || isPending}
          onClick={() => {
            startTransition(async () => {
              await addItemDoCatalogo(orcamentoId, itemCatalogoId);
              setItemCatalogoId("");
            });
          }}
          className="btn-primary"
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>

      <div className="mt-2">
        {avulsoAberto ? (
          <form
            action={(fd) => {
              startTransition(async () => {
                await addItemAvulso(orcamentoId, fd);
                setAvulsoAberto(false);
              });
            }}
            className="flex flex-wrap gap-2"
          >
            <input name="nome" placeholder="Item avulso *" required className="input flex-1 !py-1.5 text-xs" autoFocus />
            <input name="custoUnitario" type="number" step="0.01" placeholder="Valor" className="input w-28 !py-1.5 text-xs" />
            <button type="submit" className="btn-secondary !px-3 !py-1.5 text-xs">
              Adicionar avulso
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAvulsoAberto(true)}
            className="flex items-center gap-1 text-xs text-accent-hover hover:underline"
          >
            <Plus size={12} /> Item avulso (fora do catálogo)
          </button>
        )}
      </div>
    </div>
  );
}
