"use client";

import { useState, useRef } from "react";
import { createLancamento } from "../actions";
import { FORMAS_PAGAMENTO } from "../constants";
import { Plus, X } from "lucide-react";

type Cliente = { id: string; nome: string };
type Projeto = { id: string; nome: string; clienteId: string };

export function NewLancamentoForm({
  clientes,
  projetos,
  controlled,
}: {
  clientes: Cliente[];
  projetos: Projeto[];
  controlled?: { open: boolean; onClose: () => void };
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [tipoPadrao, setTipoPadrao] = useState<"RECEITA" | "DESPESA">("RECEITA");
  const [clienteId, setClienteId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = (v: boolean) => (controlled ? !v && controlled.onClose() : setInternalOpen(v));

  function abrir(tipo: "RECEITA" | "DESPESA") {
    setTipoPadrao(tipo);
    setInternalOpen(true);
  }

  const projetosDoCliente = projetos.filter((p) => !clienteId || p.clienteId === clienteId);

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
                setClienteId("");
                setOpen(false);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              encType="multipart/form-data"
            >
              <select name="tipo" defaultValue={tipoPadrao} className="input col-span-2">
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <input name="descricao" placeholder="Descrição *" required className="input col-span-2" />
              <input name="categoria" placeholder="Categoria" className="input" />
              <input name="valor" type="number" step="0.01" placeholder="Valor *" required className="input" />
              <input name="vencimento" type="date" required className="input col-span-2" />

              <select
                name="clienteId"
                className="input"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Cliente (opcional)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select name="projetoId" className="input" disabled={projetosDoCliente.length === 0}>
                <option value="">Projeto (opcional)</option>
                {projetosDoCliente.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select name="formaPagamento" className="input col-span-2" defaultValue="">
                <option value="">Forma de pagamento (opcional)</option>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <label className="col-span-2 text-xs text-muted">
                Comprovante (opcional)
                <input name="comprovante" type="file" className="input mt-1" />
              </label>

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
