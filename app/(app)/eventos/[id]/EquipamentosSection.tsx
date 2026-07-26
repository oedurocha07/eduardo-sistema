"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createEquipamento, updateEquipamentoStatus, deleteEquipamento } from "../actions";
import { STATUS_EQUIPAMENTO } from "../constants";
import { StatusEquipamento } from "@/app/generated/prisma/client";

type Equip = { id: string; nome: string; responsavel: string | null; status: StatusEquipamento; quantidade: number };

export function EquipamentosSection({ eventoId, equipamentos }: { eventoId: string; equipamentos: Equip[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const prontos = equipamentos.filter((e) => e.status !== "PENDENTE").length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Equipamentos e responsáveis</h2>
          <p className="text-sm text-muted">O que vai para o evento, com quem está e o que ainda falta.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{prontos}/{equipamentos.length} preparados</span>
          <button onClick={() => setAberto((v) => !v)} className="btn-primary">
            <Plus size={15} /> Item
          </button>
        </div>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createEquipamento(eventoId, fd);
              setAberto(false);
            });
          }}
          className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
        >
          <input name="nome" placeholder="Equipamento *" required className="input" autoFocus />
          <input name="quantidade" type="number" min="1" defaultValue="1" className="input w-20" />
          <input name="responsavel" placeholder="Responsável" className="input" />
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar
          </button>
        </form>
      )}

      {equipamentos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          Nenhum equipamento cadastrado.
        </p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Qtd</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-2.5 font-medium text-foreground">{e.nome}</td>
                  <td className="px-4 py-2.5 text-muted">{e.quantidade}</td>
                  <td className="px-4 py-2.5 text-muted">{e.responsavel ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={e.status}
                      disabled={isPending}
                      onChange={(ev) => startTransition(() => updateEquipamentoStatus(e.id, eventoId, ev.target.value as StatusEquipamento))}
                      className="input !py-1 text-xs"
                    >
                      {STATUS_EQUIPAMENTO.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => startTransition(() => deleteEquipamento(e.id, eventoId))} className="text-muted hover:text-danger">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
