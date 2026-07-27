"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateEmpresa } from "../actions";

type Empresa = { id: string; nome: string; cidade: string | null; segmento: string | null };

export function EditEmpresaButton({ empresa }: { empresa: Empresa }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-muted hover:text-foreground" title="Editar empresa">
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Editar empresa</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (formData) => {
                await updateEmpresa(empresa.id, formData);
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="nome" defaultValue={empresa.nome} placeholder="Nome *" required className="input" />
              <input name="cidade" defaultValue={empresa.cidade ?? ""} placeholder="Cidade" className="input" />
              <input name="segmento" defaultValue={empresa.segmento ?? ""} placeholder="Segmento" className="input" />
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
