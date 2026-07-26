"use client";

import { useState, useRef } from "react";
import { createProposta } from "./actions";
import { Plus, X, Paperclip } from "lucide-react";

type Opcao = { id: string; label: string };

export function NewPropostaForm({
  leads,
  clientes,
  controlled,
}: {
  leads: Opcao[];
  clientes: Opcao[];
  controlled?: { open: boolean; onClose: () => void };
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = (v: boolean) => (controlled ? !v && controlled.onClose() : setInternalOpen(v));

  return (
    <>
      {!controlled && (
        <button onClick={() => setInternalOpen(true)} className="btn-primary">
          <Plus size={16} />
          Nova proposta
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Nova proposta</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createProposta(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="titulo" placeholder="Título *" required className="input" />
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
              <input name="valor" type="number" step="0.01" placeholder="Valor" className="input" />
              <textarea name="conteudo" placeholder="Conteúdo / observações" className="input" rows={3} />
              <label className="flex items-center gap-2 text-sm text-muted">
                <Paperclip size={14} />
                Anexar proposta
              </label>
              <input name="arquivo" type="file" className="input" />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
