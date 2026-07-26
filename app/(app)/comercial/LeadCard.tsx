"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateLeadEtapa } from "./actions";
import { EtapaLead } from "@/app/generated/prisma/client";
import { ETAPAS } from "./constants";
import { Money } from "@/app/components/ui/Money";
import { Flame, Sun, Snowflake, AlertTriangle } from "lucide-react";

const TEMPERATURA_ICON: Record<string, { icon: typeof Flame; color: string }> = {
  FRIO: { icon: Snowflake, color: "text-blue-400" },
  MORNO: { icon: Sun, color: "text-warning" },
  QUENTE: { icon: Flame, color: "text-danger" },
};

type LeadCardProps = {
  id: string;
  empresaNome: string;
  contatoNome: string;
  valorEstimado: string | null;
  temperatura: string;
  etapa: EtapaLead;
  proximaAcao: string | null;
};

export function LeadCard({ id, empresaNome, contatoNome, valorEstimado, temperatura, etapa, proximaAcao }: LeadCardProps) {
  const [isPending, startTransition] = useTransition();
  const temp = TEMPERATURA_ICON[temperatura];
  const TempIcon = temp.icon;

  return (
    <div className="card gap-0 p-3 shadow-sm transition-colors hover:border-accent/50">
      <Link href={`/comercial/leads/${id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{empresaNome}</div>
            <div className="truncate text-xs text-muted">{contatoNome}</div>
          </div>
          <TempIcon size={15} className={`shrink-0 ${temp.color}`} />
        </div>
        <div className="mb-2 text-sm font-semibold text-foreground">
          {valorEstimado ? <Money value={Number(valorEstimado)} /> : "—"}
        </div>
        {!proximaAcao && (
          <div className="mb-2 flex items-center gap-1 text-[11px] text-danger">
            <AlertTriangle size={11} />
            Sem próxima ação
          </div>
        )}
      </Link>
      <select
        value={etapa}
        disabled={isPending}
        onChange={(e) => startTransition(() => updateLeadEtapa(id, e.target.value as EtapaLead))}
        className="input py-1.5 text-xs"
      >
        {ETAPAS.map((et) => (
          <option key={et.value} value={et.value}>
            {et.label}
          </option>
        ))}
      </select>
    </div>
  );
}
