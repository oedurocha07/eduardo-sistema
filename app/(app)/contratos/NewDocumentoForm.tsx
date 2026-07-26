"use client";

import { useState, useRef } from "react";
import { createDocumento } from "./actions";
import { Plus, X, Paperclip } from "lucide-react";

type Opcao = { id: string; label: string };

export function NewDocumentoForm({ leads, clientes }: { leads: Opcao[]; clientes: Opcao[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Novo contrato
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo contrato</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createDocumento(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="nome" placeholder="Nome do contrato *" required className="input" />
              <select name="alvo" className="input">
                <option value="">Lead / Cliente (opcional)</option>
                {leads.length > 0 && (
                  <optgroup label="Leads">
                    {leads.map((l) => (
                      <option key={l.id} value={`lead:${l.id}`}>
                        {l.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {clientes.length > 0 && (
                  <optgroup label="Clientes">
                    {clientes.map((c) => (
                      <option key={c.id} value={`cliente:${c.id}`}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <input name="descricao" placeholder="Descrição" className="input" />
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
