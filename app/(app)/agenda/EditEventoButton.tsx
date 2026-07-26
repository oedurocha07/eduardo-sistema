"use client";

import { useState, useRef } from "react";
import { updateEvento } from "./actions";
import { EventoFormFields } from "./EventoFormFields";
import { Pencil, X } from "lucide-react";

type Evento = {
  id: string;
  titulo: string;
  tipo: string;
  local: string | null;
  data: Date;
  dataFim: Date | null;
  participantes: string | null;
  descricao: string | null;
};

function paraDatetimeLocal(d: Date | null) {
  if (!d) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export function EditEventoButton({ evento }: { evento: Evento }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-muted hover:text-foreground" title="Editar evento">
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Editar evento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await updateEvento(evento.id, formData);
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <EventoFormFields
                defaults={{
                  titulo: evento.titulo,
                  tipo: evento.tipo,
                  local: evento.local,
                  data: paraDatetimeLocal(evento.data),
                  dataFim: paraDatetimeLocal(evento.dataFim),
                  participantes: evento.participantes,
                  descricao: evento.descricao,
                }}
              />
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
