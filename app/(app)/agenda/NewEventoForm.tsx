"use client";

import { useState, useRef } from "react";
import { createEvento } from "./actions";
import { EventoFormFields } from "./EventoFormFields";
import { Plus, X } from "lucide-react";

export function NewEventoForm({
  defaultData,
  trigger,
  controlled,
}: {
  defaultData?: string;
  trigger?: React.ReactNode;
  controlled?: { open: boolean; onClose: () => void };
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = (v: boolean) => (controlled ? !v && controlled.onClose() : setInternalOpen(v));

  return (
    <>
      {!controlled &&
        (trigger ? (
          <span onClick={() => setInternalOpen(true)}>{trigger}</span>
        ) : (
          <button onClick={() => setInternalOpen(true)} className="btn-primary">
            <Plus size={16} />
            Novo evento
          </button>
        ))}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo evento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createEvento(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <EventoFormFields defaults={{ data: defaultData }} />
              <div className="mt-2 flex justify-end gap-2">
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
