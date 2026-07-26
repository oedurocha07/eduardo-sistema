"use client";

import { useState, useRef } from "react";
import { createCliente } from "./actions";
import { ClienteFormFields } from "./ClienteFormFields";
import { Plus, X } from "lucide-react";

export function NewClienteForm({ controlled }: { controlled?: { open: boolean; onClose: () => void } }) {
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
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg gap-0 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo cliente recorrente</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createCliente(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
            >
              <ClienteFormFields />
              <div className="mt-4 flex justify-end gap-2">
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
