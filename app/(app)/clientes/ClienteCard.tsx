"use client";

import { useState, useRef, useTransition } from "react";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { updateCliente, setStatus, deleteCliente, addItemLocado } from "./actions";
import { ClienteBillingFields } from "@/app/components/comercial/ClienteBillingFields";
import { ItemLocadoRow } from "./ItemLocadoRow";
import { StatusClienteRecorrente } from "@/app/generated/prisma/client";
import { Pencil, Trash2, X, Plus } from "lucide-react";

const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  ATIVO: "success",
  PAUSADO: "warning",
  ENCERRADO: "neutral",
};

type ItemLocado = { id: string; item: string; quantidade: number; valorUnitario: number };

type Cliente = {
  id: string;
  nome: string;
  cnpjCpf: string | null;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  status: StatusClienteRecorrente;
  recorrente: boolean;
  valorMensal: number | null;
  diaVencimento: number | null;
  valorTrabalho: number | null;
  formaPagamento: string | null;
  descricaoServico: string | null;
  descricaoNbs: string | null;
  codigoServicoMunicipal: string | null;
  codigoTributacaoNacional: string | null;
  idClienteAsaas: string | null;
  enviarFaturaLocacao: boolean;
  observacoes: string | null;
  itensLocados: ItemLocado[];
};

export function ClienteCard({ cliente }: { cliente: Cliente }) {
  const [editOpen, setEditOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editFormRef = useRef<HTMLFormElement>(null);
  const itemFormRef = useRef<HTMLFormElement>(null);

  const totalItens = cliente.itensLocados.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);

  return (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{cliente.nome}</span>
            <select
              value={cliente.status}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() => setStatus(cliente.id, e.target.value as StatusClienteRecorrente))
              }
              className={`badge cursor-pointer border-none bg-transparent ${
                STATUS_TONE[cliente.status] === "success"
                  ? "text-success"
                  : STATUS_TONE[cliente.status] === "warning"
                    ? "text-warning"
                    : "text-muted"
              }`}
            >
              <option value="ATIVO">Ativo</option>
              <option value="PAUSADO">Pausado</option>
              <option value="ENCERRADO">Encerrado</option>
            </select>
            <Badge tone={cliente.recorrente ? "neutral" : "warning"}>{cliente.recorrente ? "Recorrente" : "Avulso"}</Badge>
          </div>
          <div className="text-sm text-muted">{cliente.email}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {cliente.recorrente ? (
                <Money value={cliente.valorMensal ?? 0} suffix="/mês" />
              ) : (
                <Money value={cliente.valorTrabalho ?? 0} />
              )}
            </div>
            {cliente.recorrente
              ? cliente.diaVencimento && <div className="text-xs text-muted">Vence dia {cliente.diaVencimento}</div>
              : cliente.formaPagamento && <div className="text-xs text-muted">{cliente.formaPagamento}</div>}
          </div>
          <button onClick={() => setEditOpen(true)} className="text-muted hover:text-foreground" title="Editar">
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Excluir o cliente ${cliente.nome}? Isso também remove os itens locados dele.`)) {
                startTransition(() => deleteCliente(cliente.id));
              }
            }}
            className="text-muted hover:text-danger"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <div className="text-xs text-muted">CNPJ/CPF</div>
          <div className="text-foreground">{cliente.cnpjCpf ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Serviço (NBS)</div>
          <div className="text-foreground">{cliente.descricaoNbs ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Código municipal</div>
          <div className="text-foreground">{cliente.codigoServicoMunicipal ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Fatura de locação (60/40)</div>
          <div className="text-foreground">{cliente.enviarFaturaLocacao ? "Sim" : "Não"}</div>
        </div>
      </div>

      {cliente.descricaoServico && <p className="mt-3 text-sm text-muted">{cliente.descricaoServico}</p>}

      <div className="mt-3 border-t border-border pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-muted uppercase">
            Itens locados
            {cliente.itensLocados.length > 0 && (
              <>
                {" · "}
                <Money value={totalItens} />
              </>
            )}
            {!cliente.enviarFaturaLocacao && cliente.itensLocados.length > 0 && (
              <span className="ml-1 normal-case text-muted">(fatura de locação desligada — não entram na próxima fatura)</span>
            )}
          </span>
          <button onClick={() => setItemFormOpen((v) => !v)} className="text-xs text-accent-hover hover:underline">
            + item
          </button>
        </div>
        {cliente.itensLocados.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cliente.itensLocados.map((item) => (
              <ItemLocadoRow key={item.id} item={item} />
            ))}
          </div>
        )}
        {itemFormOpen && (
          <form
            ref={itemFormRef}
            action={async (formData) => {
              await addItemLocado(formData);
              itemFormRef.current?.reset();
              setItemFormOpen(false);
            }}
            className="mt-2 flex flex-wrap gap-2"
          >
            <input type="hidden" name="clienteRecorrenteId" value={cliente.id} />
            <input name="item" placeholder="Item *" required className="input w-40" />
            <input name="quantidade" type="number" defaultValue={1} className="input w-20" />
            <input name="valorUnitario" type="number" step="0.01" placeholder="Valor" className="input w-28" />
            <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
              <Plus size={14} />
            </button>
          </form>
        )}
      </div>

      {cliente.observacoes && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">{cliente.observacoes}</p>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditOpen(false)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg gap-0 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Editar cliente</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form
              ref={editFormRef}
              action={async (formData) => {
                await updateCliente(formData);
                setEditOpen(false);
              }}
            >
              <input type="hidden" name="id" value={cliente.id} />
              <ClienteBillingFields defaults={cliente} mostrarItensLocados={false} />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">
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
    </div>
  );
}
