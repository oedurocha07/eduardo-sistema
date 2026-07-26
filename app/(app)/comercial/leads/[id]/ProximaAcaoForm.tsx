"use client";

import { useRef, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { updateProximaAcao } from "@/app/(app)/comercial/actions";

export function ProximaAcaoForm({
  leadId,
  proximaAcao,
  proximaAcaoEm,
  onChanged,
}: {
  leadId: string;
  proximaAcao: string | null;
  proximaAcaoEm: Date | null;
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const dataValue = proximaAcaoEm ? proximaAcaoEm.toISOString().slice(0, 10) : "";
  const horaValue = proximaAcaoEm ? proximaAcaoEm.toISOString().slice(11, 16) : "09:00";

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted uppercase">Próxima ação</h3>
      <form
        ref={formRef}
        action={(formData) => startTransition(async () => { await updateProximaAcao(leadId, formData); onChanged?.(); })}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          name="proximaAcao"
          defaultValue={proximaAcao ?? ""}
          placeholder="O que precisa ser feito?"
          className="input flex-1"
        />
        <input name="data" type="date" defaultValue={dataValue} className="input sm:w-40" />
        <input name="hora" type="time" defaultValue={horaValue} className="input sm:w-28" />
        <button type="submit" disabled={isPending} className="btn-primary shrink-0">
          Salvar
        </button>
      </form>
      {!proximaAcao && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
          <AlertTriangle size={13} />
          Esse lead está sem próxima ação. Defina uma para não perder o ritmo.
        </p>
      )}
    </div>
  );
}
