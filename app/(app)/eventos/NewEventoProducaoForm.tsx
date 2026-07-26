"use client";

import { useState, useRef } from "react";
import { createEvento } from "./actions";
import { Plus, X } from "lucide-react";

type Cliente = { id: string; nome: string };

export function NewEventoProducaoForm({ clientes }: { clientes: Cliente[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Novo evento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo evento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form ref={formRef} action={createEvento} className="grid grid-cols-2 gap-3">
              <input name="nome" placeholder="Nome do evento *" required className="input col-span-2" />
              <input name="local" placeholder="Local" className="input col-span-2" />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Início *</label>
                <input name="dataInicio" type="datetime-local" required className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Fim</label>
                <input name="dataFim" type="datetime-local" className="input" />
              </div>
              <select name="clienteId" className="input col-span-2">
                <option value="">Cliente (opcional)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
