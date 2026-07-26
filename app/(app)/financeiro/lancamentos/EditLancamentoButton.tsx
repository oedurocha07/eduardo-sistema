"use client";

import { useState, useRef } from "react";
import { updateLancamento } from "../actions";
import { FORMAS_PAGAMENTO } from "../constants";
import { Pencil, X } from "lucide-react";

type Cliente = { id: string; nome: string };
type Projeto = { id: string; nome: string; clienteId: string };
type LancamentoEdit = {
  id: string;
  tipo: "RECEITA" | "DESPESA";
  descricao: string;
  categoria: string | null;
  valor: number;
  vencimento: Date;
  clienteId: string | null;
  projetoId: string | null;
  formaPagamento: string | null;
  comprovanteUrl: string | null;
};

export function EditLancamentoButton({
  lancamento,
  clientes,
  projetos,
}: {
  lancamento: LancamentoEdit;
  clientes: Cliente[];
  projetos: Projeto[];
}) {
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState(lancamento.clienteId ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  const projetosDoCliente = projetos.filter((p) => !clienteId || p.clienteId === clienteId);
  const vencimentoISO = lancamento.vencimento.toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar lançamento"
        className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
      >
        <Pencil size={13} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 w-full max-w-lg gap-0 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Editar lançamento</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={formRef}
              action={async (formData) => {
                await updateLancamento(lancamento.id, formData);
                setOpen(false);
              }}
              className="grid grid-cols-2 gap-3"
              encType="multipart/form-data"
            >
              <select name="tipo" defaultValue={lancamento.tipo} className="input col-span-2">
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <input
                name="descricao"
                defaultValue={lancamento.descricao}
                placeholder="Descrição *"
                required
                className="input col-span-2"
              />
              <input name="categoria" defaultValue={lancamento.categoria ?? ""} placeholder="Categoria" className="input" />
              <input
                name="valor"
                type="number"
                step="0.01"
                defaultValue={lancamento.valor}
                placeholder="Valor *"
                required
                className="input"
              />
              <input name="vencimento" type="date" defaultValue={vencimentoISO} required className="input col-span-2" />

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
              <select name="projetoId" className="input" defaultValue={lancamento.projetoId ?? ""} disabled={projetosDoCliente.length === 0}>
                <option value="">Projeto (opcional)</option>
                {projetosDoCliente.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select name="formaPagamento" className="input col-span-2" defaultValue={lancamento.formaPagamento ?? ""}>
                <option value="">Forma de pagamento (opcional)</option>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <label className="col-span-2 text-xs text-muted">
                {lancamento.comprovanteUrl ? "Substituir comprovante (opcional)" : "Comprovante (opcional)"}
                <input name="comprovante" type="file" className="input mt-1" />
              </label>
              {lancamento.comprovanteUrl && (
                <a
                  href={lancamento.comprovanteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2 -mt-2 text-xs text-accent-hover hover:underline"
                >
                  Ver comprovante atual
                </a>
              )}

              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
