"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createChecklistItem, toggleChecklistItem, deleteChecklistItem } from "../actions";
import { FASES_CHECKLIST } from "../constants";
import { FaseChecklist } from "@/app/generated/prisma/client";

type Item = { id: string; titulo: string; fase: FaseChecklist; concluido: boolean };

export function ChecklistSection({ eventoId, itens }: { eventoId: string; itens: Item[] }) {
  const [faseAberta, setFaseAberta] = useState<FaseChecklist | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = itens.length;
  const feitos = itens.filter((i) => i.concluido).length;
  const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Checklists</h2>
          <p className="text-sm text-muted">Preparação, montagem, operação e encerramento.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{pct}%</div>
          <div className="text-xs text-muted">{feitos}/{total} prontos</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FASES_CHECKLIST.map((fase) => {
          const doFase = itens.filter((i) => i.fase === fase.value);
          return (
            <div key={fase.value} className="card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{fase.label}</h3>
                <span className="text-xs text-muted">
                  {doFase.filter((i) => i.concluido).length}/{doFase.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {doFase.map((item) => (
                  <div key={item.id} className="group flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.concluido}
                      disabled={isPending}
                      onChange={(e) => startTransition(() => toggleChecklistItem(item.id, eventoId, e.target.checked))}
                      className="accent-accent"
                    />
                    <span className={`flex-1 ${item.concluido ? "text-muted line-through" : "text-foreground"}`}>{item.titulo}</span>
                    <button
                      onClick={() => startTransition(() => deleteChecklistItem(item.id, eventoId))}
                      className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {doFase.length === 0 && <p className="text-xs text-muted">Nenhum item.</p>}
              </div>

              {faseAberta === fase.value ? (
                <form
                  action={(fd) => {
                    startTransition(async () => {
                      await createChecklistItem(eventoId, fd);
                      setFaseAberta(null);
                    });
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input type="hidden" name="fase" value={fase.value} />
                  <input name="titulo" placeholder="Novo item" required className="input !py-1 text-xs" autoFocus />
                  <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
                    Add
                  </button>
                </form>
              ) : (
                <button onClick={() => setFaseAberta(fase.value)} className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline">
                  <Plus size={12} /> Adicionar item
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
