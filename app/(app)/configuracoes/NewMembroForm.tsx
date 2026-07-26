"use client";

import { useState, useRef } from "react";
import { createMembro } from "./actions";
import { Plus, X } from "lucide-react";

export function NewMembroForm() {
  const [open, setOpen] = useState(false);
  const [resultado, setResultado] = useState<{ email: string; senha: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mt-4">
      {resultado && (
        <div className="mb-3 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-foreground">
          Membro criado: <strong>{resultado.email}</strong> — senha temporária:{" "}
          <code className="rounded bg-surface-hover px-1.5 py-0.5">{resultado.senha}</code>
          <br />
          <span className="text-muted">Anote agora — não será mostrada de novo.</span>
        </div>
      )}

      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Convidar novo membro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-md gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Convidar membro</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                const res = await createMembro(formData);
                setResultado(res);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <input name="nome" placeholder="Nome *" required className="input" />
              <input name="email" type="email" placeholder="E-mail *" required className="input" />
              <select name="papel" defaultValue="MEMBRO" className="input">
                <option value="MEMBRO">Membro (acesso limitado)</option>
                <option value="ADMIN">Admin (acesso total)</option>
              </select>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
