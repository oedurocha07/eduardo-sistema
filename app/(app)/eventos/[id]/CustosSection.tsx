"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { createCusto, deleteCusto } from "../actions";
import { TIPOS_CUSTO } from "../constants";
import { TipoCustoEvento } from "@/app/generated/prisma/client";

type Custo = { id: string; descricao: string; tipo: TipoCustoEvento; valor: number };

export function CustosSection({ eventoId, custos }: { eventoId: string; custos: Custo[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const total = custos.reduce((s, c) => s + c.valor, 0);
  const label = (t: TipoCustoEvento) => TIPOS_CUSTO.find((x) => x.value === t)?.label ?? t;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Custos da operação</h2>
          <p className="text-sm text-muted">Cachês, adicionais e equipamentos antes de levar ao financeiro.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted uppercase">Total</div>
            <div className="font-semibold text-danger"><Money value={total} /></div>
          </div>
          <button onClick={() => setAberto((v) => !v)} className="btn-primary">
            <Plus size={15} /> Custo
          </button>
        </div>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createCusto(eventoId, fd);
              setAberto(false);
            });
          }}
          className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
        >
          <input name="descricao" placeholder="Descrição *" required className="input" autoFocus />
          <select name="tipo" defaultValue="OUTRO" className="input">
            {TIPOS_CUSTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input name="valor" type="number" step="0.01" placeholder="Valor *" required className="input w-32" />
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar
          </button>
        </form>
      )}

      {custos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          Nenhum custo lançado.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {custos.map((c) => (
            <div key={c.id} className="card group flex items-center justify-between p-3">
              <div>
                <div className="font-medium text-foreground">{c.descricao}</div>
                <div className="text-xs text-muted">{label(c.tipo)}</div>
              </div>
              <div className="flex items-center gap-3">
                <Money value={c.valor} className="font-medium text-danger" />
                <button onClick={() => startTransition(() => deleteCusto(c.id, eventoId))} className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
