"use client";

import { useState, useTransition, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { updateItemLocado, deleteItemLocado } from "./actions";

type ItemLocado = { id: string; item: string; quantidade: number; valorUnitario: number };

function salvarAoApertarEnter(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    e.preventDefault();
    e.currentTarget.blur();
  }
}

export function ItemLocadoRow({ item }: { item: ItemLocado }) {
  const [nome, setNome] = useState(item.item);
  const [quantidade, setQuantidade] = useState(item.quantidade);
  const [valorUnitario, setValorUnitario] = useState(item.valorUnitario);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    if (!nome.trim()) return;
    startTransition(() => updateItemLocado(item.id, nome, quantidade, valorUnitario));
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onBlur={salvar}
        onKeyDown={salvarAoApertarEnter}
        disabled={isPending}
        placeholder="Item"
        className="input w-32 !py-1 text-xs"
      />
      <input
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
        onBlur={salvar}
        onKeyDown={salvarAoApertarEnter}
        disabled={isPending}
        min={1}
        placeholder="Qtd"
        className="input w-14 !py-1 text-xs"
      />
      <input
        type="number"
        step="0.01"
        value={valorUnitario}
        onChange={(e) => setValorUnitario(Number(e.target.value))}
        onBlur={salvar}
        onKeyDown={salvarAoApertarEnter}
        disabled={isPending}
        placeholder="Valor un."
        className="input w-24 !py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => startTransition(() => deleteItemLocado(item.id))}
        className="text-muted hover:text-danger"
      >
        <X size={12} />
      </button>
    </div>
  );
}
