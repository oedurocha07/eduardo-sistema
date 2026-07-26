"use client";

import { useState, useRef } from "react";
import { createOrcamento } from "./actions";
import { Plus, X, Paperclip } from "lucide-react";

export function NewOrcamentoForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Projeto Personalizado
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo orçamento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createOrcamento(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="tipo" defaultValue="Projeto Personalizado" placeholder="Tipo" className="input" />
              <input name="descricao" placeholder="Descrição" className="input" />
              <input
                name="custoEstimado"
                type="number"
                step="0.01"
                placeholder="Custo estimado *"
                required
                className="input"
              />
              <input name="margem" type="number" step="1" placeholder="Margem de lucro (%)" className="input" />
              <label className="flex items-center gap-2 text-sm text-muted">
                <Paperclip size={14} />
                Anexar arquivo
              </label>
              <input name="arquivo" type="file" className="input" />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Calcular e salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
