"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createTarefa, toggleTarefa, deleteTarefa } from "../actions";

type Tarefa = { id: string; titulo: string; concluida: boolean; prazo: Date | null };

export function TarefasList({ projetoId, tarefas }: { projetoId: string; tarefas: Tarefa[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const hoje = new Date();

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-col gap-1.5">
        {tarefas.map((t) => {
          const atrasada = !t.concluida && t.prazo && t.prazo < hoje;
          return (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.concluida}
                disabled={isPending}
                onChange={(e) => startTransition(() => toggleTarefa(t.id, e.target.checked))}
                className="accent-accent"
              />
              <span className={`flex-1 ${t.concluida ? "text-muted line-through" : "text-foreground"}`}>{t.titulo}</span>
              {t.prazo && (
                <span className={`text-xs ${atrasada ? "text-danger" : "text-muted"}`}>
                  {t.prazo.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
              )}
              <button
                onClick={() => startTransition(() => deleteTarefa(t.id))}
                className="text-muted hover:text-danger"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
        {tarefas.length === 0 && <p className="text-xs text-muted">Nenhuma tarefa ainda.</p>}
      </div>

      {open ? (
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await createTarefa(formData);
              formRef.current?.reset();
              setOpen(false);
            });
          }}
          className="mt-2 flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="projetoId" value={projetoId} />
          <input name="titulo" placeholder="Nova tarefa" required className="input flex-1 !py-1 text-xs" />
          <input name="prazo" type="date" className="input !py-1 text-xs" />
          <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
            Adicionar
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost !px-2 !py-1 text-xs">
            Cancelar
          </button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline">
          <Plus size={12} /> Nova tarefa
        </button>
      )}
    </div>
  );
}
