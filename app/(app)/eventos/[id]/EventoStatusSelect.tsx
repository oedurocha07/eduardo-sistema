"use client";

import { useTransition } from "react";
import { updateEventoStatus } from "../actions";
import { STATUS_EVENTO } from "../constants";
import { StatusEvento } from "@/app/generated/prisma/client";

export function EventoStatusSelect({ id, status }: { id: string; status: StatusEvento }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateEventoStatus(id, e.target.value as StatusEvento))}
      className="input w-40"
    >
      {STATUS_EVENTO.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
