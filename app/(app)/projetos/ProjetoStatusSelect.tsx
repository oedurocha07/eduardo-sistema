"use client";

import { useTransition } from "react";
import { updateProjetoStatus } from "./actions";
import { EtapaProducao } from "@/app/generated/prisma/client";
import { ETAPAS_PRODUCAO } from "./constants";

export function ProjetoStatusSelect({ id, status }: { id: string; status: EtapaProducao }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateProjetoStatus(id, e.target.value as EtapaProducao))}
      className="input"
    >
      {ETAPAS_PRODUCAO.map((et) => (
        <option key={et.value} value={et.value}>
          {et.label}
        </option>
      ))}
    </select>
  );
}
