"use client";

import { useTransition } from "react";
import { updateLeadDetalhes } from "@/app/(app)/comercial/actions";

type Usuario = { id: string; nome: string };

export function DetalhesForm({
  leadId,
  empresaNome,
  valorEstimado,
  origem,
  responsavelId,
  usuarios,
  onChanged,
}: {
  leadId: string;
  empresaNome: string;
  valorEstimado: string | null;
  origem: string | null;
  responsavelId: string | null;
  usuarios: Usuario[];
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(async () => { await updateLeadDetalhes(leadId, formData); onChanged?.(); })}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs text-muted">Empresa</label>
        <input name="empresaNome" defaultValue={empresaNome} required className="input" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Valor (R$)</label>
        <input
          name="valorEstimado"
          type="number"
          step="0.01"
          defaultValue={valorEstimado ?? ""}
          className="input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Responsável</label>
        <select name="responsavelId" defaultValue={responsavelId ?? ""} className="input">
          <option value="">Sem responsável</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs text-muted">Origem</label>
        <input name="origem" defaultValue={origem ?? ""} placeholder="Indicação, Instagram, site..." className="input" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Salvando..." : "Salvar detalhes"}
        </button>
      </div>
    </form>
  );
}
