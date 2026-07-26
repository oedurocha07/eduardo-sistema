"use client";

import { useState } from "react";
import { createCofre } from "./actions";
import { CofreFormFields } from "./CofreFormFields";
import { Plus, X } from "lucide-react";

type Opcao = { id: string; label: string };

export function NewCofreForm({ clientes }: { clientes: Opcao[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Novo cofre
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg gap-0 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo cofre do cliente</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form action={createCofre}>
              <CofreFormFields clientes={clientes} />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar cofre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
