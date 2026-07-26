"use client";

import { useState, useRef } from "react";
import { createProjeto } from "./actions";
import { Plus, X } from "lucide-react";

type Cliente = { id: string; nome: string };

export function NewProjetoForm({ clientes }: { clientes: Cliente[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (clientes.length === 0) {
    return (
      <span className="text-sm text-muted">
        Feche um lead no Comercial para poder criar um projeto.
      </span>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Novo projeto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo projeto</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createProjeto(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="nome" placeholder="Nome do projeto *" required className="input" />
              <select name="clienteId" required className="input">
                <option value="">Cliente *</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <input name="dataEntrega" type="date" className="input" />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
