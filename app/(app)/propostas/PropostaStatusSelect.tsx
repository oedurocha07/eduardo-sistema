"use client";

import { useTransition } from "react";
import { updatePropostaStatus } from "./actions";
import { StatusProposta } from "@/app/generated/prisma/client";

const LABEL: Record<StatusProposta, string> = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
};

export function PropostaStatusSelect({ id, status }: { id: string; status: StatusProposta }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updatePropostaStatus(id, e.target.value as StatusProposta))}
      className="input"
    >
      {Object.entries(LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
