"use client";

import { Building2 } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { useLeadPopup } from "../LeadPopupContext";

export function LeadRow({
  id,
  empresaNome,
  contatoNome,
  etapaLabel,
  etapaTone,
  valorEstimado,
  responsavelNome,
  temperatura,
  proximaAcao,
}: {
  id: string;
  empresaNome: string;
  contatoNome: string;
  etapaLabel: string;
  etapaTone: "neutral" | "accent" | "success" | "danger" | "warning";
  valorEstimado: number | null;
  responsavelNome: string | null;
  temperatura: string;
  proximaAcao: string | null;
}) {
  const { abrirLead } = useLeadPopup();

  return (
    <tr onClick={() => abrirLead(id)} className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
      <td className="px-4 py-3 font-medium text-foreground">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
            <Building2 size={13} />
          </div>
          {empresaNome}
        </div>
      </td>
      <td className="px-4 py-3 text-muted">{contatoNome}</td>
      <td className="px-4 py-3">
        <Badge tone={etapaTone}>{etapaLabel}</Badge>
      </td>
      <td className="px-4 py-3 text-muted">{valorEstimado != null ? <Money value={valorEstimado} /> : "—"}</td>
      <td className="px-4 py-3 text-muted">{responsavelNome ?? "—"}</td>
      <td className="px-4 py-3 text-muted">{temperatura}</td>
      <td className="px-4 py-3 text-muted">{proximaAcao ?? "—"}</td>
    </tr>
  );
}
