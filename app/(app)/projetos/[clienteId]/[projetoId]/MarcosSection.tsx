"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createMarco, toggleMarco, deleteMarco } from "../../actions";

type Marco = { id: string; titulo: string; data: Date | null; concluido: boolean };

export function MarcosSection({
  projetoId,
  clienteId,
  itens,
}: {
  projetoId: string;
  clienteId: string;
  itens: Marco[];
}) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const feitos = itens.filter((i) => i.concluido).length;

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Marcos</h2>
        <span className="text-xs text-muted">
          {feitos}/{itens.length}
        </span>
      </div>

      {itens.length === 0 ? (
        <p className="text-sm text-muted">Nenhum marco definido ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {itens.map((item) => (
            <div key={item.id} className="group flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.concluido}
                disabled={isPending}
                onChange={(e) => startTransition(() => toggleMarco(item.id, clienteId, projetoId, e.target.checked))}
                className="accent-accent"
              />
              <span className={`flex-1 ${item.concluido ? "text-muted line-through" : "text-foreground"}`}>
                {item.titulo}
              </span>
              {item.data && (
                <span className="text-xs text-muted">{item.data.toLocaleDateString("pt-BR")}</span>
              )}
              <button
                onClick={() => startTransition(() => deleteMarco(item.id, clienteId, projetoId))}
                className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {aberto ? (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createMarco(projetoId, clienteId, fd);
              setAberto(false);
            });
          }}
          className="mt-2 flex gap-2"
        >
          <input name="titulo" placeholder="Ex: Aprovação do roteiro" required className="input flex-1 !py-1 text-xs" autoFocus />
          <input name="data" type="date" className="input !py-1 text-xs" />
          <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline"
        >
          <Plus size={12} /> Adicionar marco
        </button>
      )}
    </div>
  );
}
