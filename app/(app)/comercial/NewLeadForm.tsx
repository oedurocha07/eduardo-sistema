"use client";

import { useState, useRef } from "react";
import { createLead } from "./actions";
import { Plus, X } from "lucide-react";

export function NewLeadForm({ controlled }: { controlled?: { open: boolean; onClose: () => void } }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = (v: boolean) => (controlled ? !v && controlled.onClose() : setInternalOpen(v));

  return (
    <>
      {!controlled && (
        <button onClick={() => setInternalOpen(true)} className="btn-primary">
          <Plus size={16} />
          Novo cliente
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo cliente</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form
              ref={formRef}
              action={async (formData) => {
                await createLead(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <input name="empresa" placeholder="Empresa *" required className="input col-span-2" />
              <input name="contato" placeholder="Contato *" required className="input" />
              <input name="email" type="email" placeholder="E-mail" className="input" />
              <input name="telefone" placeholder="Telefone" className="input" />
              <input name="valorEstimado" type="number" step="0.01" placeholder="Valor estimado" className="input" />
              <input name="origem" placeholder="Origem" className="input" />
              <input name="cidade" placeholder="Cidade" className="input" />
              <input name="segmento" placeholder="Segmento" className="input" />
              <select name="temperatura" defaultValue="MORNO" className="input">
                <option value="FRIO">Frio</option>
                <option value="MORNO">Morno</option>
                <option value="QUENTE">Quente</option>
              </select>
              <input name="proximaAcao" placeholder="Próxima ação" className="input col-span-2" />
              <input name="proximaAcaoEm" type="date" className="input col-span-2" />

              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
