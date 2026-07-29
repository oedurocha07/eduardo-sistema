"use client";

import { useState, useRef } from "react";
import { createProposta } from "./actions";
import { ClienteSelect } from "@/app/components/comercial/ClienteSelect";
import { Plus, X } from "lucide-react";

type Opcao = { id: string; label: string };

export function NewPropostaForm({
  clientesRecorrentes,
  clientesFreela,
  controlled,
}: {
  clientesRecorrentes: Opcao[];
  clientesFreela: Opcao[];
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
            <p className="mb-3 text-xs text-muted">
              Comece com o essencial — o resto (conceito, escopo, cronograma, investimento) você preenche na página da
              proposta.
            </p>
            <form ref={formRef} action={createProposta} className="flex flex-col gap-3">
              <input name="titulo" placeholder="Nome do projeto *" required className="input" />
              <ClienteSelect clientesRecorrentes={clientesRecorrentes} clientesFreela={clientesFreela} />
              <input name="nomeManual" placeholder="Ou digite o nome do cliente (se não estiver na base)" className="input" />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar e continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
