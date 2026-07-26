"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateContato } from "../actions";

type Contato = { id: string; nome: string; cargo: string | null; email: string | null; telefone: string | null };

export function EditContatoButton({ contato }: { contato: Contato }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-muted hover:text-foreground" title="Editar contato">
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Editar contato</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (formData) => {
                await updateContato(contato.id, formData);
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="nome" defaultValue={contato.nome} placeholder="Nome *" required className="input" />
              <input name="cargo" defaultValue={contato.cargo ?? ""} placeholder="Cargo" className="input" />
              <input name="email" type="email" defaultValue={contato.email ?? ""} placeholder="E-mail" className="input" />
              <input name="telefone" defaultValue={contato.telefone ?? ""} placeholder="Telefone" className="input" />
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
