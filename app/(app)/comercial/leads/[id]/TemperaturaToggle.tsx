"use client";

import { useTransition } from "react";
import { Snowflake, Sun, Flame } from "lucide-react";
import { Temperatura } from "@/app/generated/prisma/client";
import { updateLeadTemperatura } from "@/app/(app)/comercial/actions";

const OPCOES: { value: Temperatura; label: string; icon: typeof Flame; color: string }[] = [
  { value: "FRIO", label: "Frio", icon: Snowflake, color: "text-blue-400" },
  { value: "MORNO", label: "Morno", icon: Sun, color: "text-warning" },
  { value: "QUENTE", label: "Quente", icon: Flame, color: "text-danger" },
];

export function TemperaturaToggle({
  leadId,
  temperatura,
  onChanged,
}: {
  leadId: string;
  temperatura: Temperatura;
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex items-center gap-1 rounded-lg border border-border p-1 ${isPending ? "opacity-60" : ""}`}>
      {OPCOES.map((op) => {
        const Icon = op.icon;
        const ativo = temperatura === op.value;
        return (
          <button
            key={op.value}
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await updateLeadTemperatura(leadId, op.value); onChanged?.(); })}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              ativo ? "bg-surface-hover text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon size={14} className={ativo ? op.color : ""} />
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
