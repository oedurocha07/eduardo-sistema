"use client";

import { useState, useRef } from "react";
import { createLancamento } from "../actions";
import { Plus, X } from "lucide-react";

export function NewLancamentoForm({ controlled }: { controlled?: { open: boolean; onClose: () => void } }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [tipoPadrao, setTipoPadrao] = useState<"RECEITA" | "DESPESA">("RECEITA");
  const formRef = useRef<HTMLFormElement>(null);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = (v: boolean) => (controlled ? !v && controlled.onClose() : setInternalOpen(v));

  function abrir(tipo: "RECEITA" | "DESPESA") {
    setTipoPadrao(tipo);
    setInternalOpen(true);
  }

  return (
    <>
      {!controlled && (
        <div className="mb-4 flex gap-2">
          <button onClick={() => abrir("RECEITA")} className="btn-primary bg-success hover:opacity-90">
            <Plus size={16} />
            Nova receita
          </button>
          <button onClick={() => abrir("DESPESA")} className="btn-danger">
            <Plus size={16} />
            Nova despesa
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Novo lançamento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await createLancamento(formData);
                formRef.current?.reset();
                setOpen(false);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <select name="tipo" defaultValue={tipoPadrao} className="input col-span-2">
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <input name="descricao" placeholder="Descrição *" required className="input col-span-2" />
              <input name="categoria" placeholder="Categoria" className="input" />
              <input name="valor" type="number" step="0.01" placeholder="Valor *" required className="input" />
              <input name="vencimento" type="date" required className="input col-span-2" />
              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
