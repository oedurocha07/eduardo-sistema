"use client";

import { useTransition } from "react";
import { XCircle, CheckCircle2 } from "lucide-react";
import { EtapaLead } from "@/app/generated/prisma/client";
import { updateLeadEtapa } from "@/app/(app)/comercial/actions";

export function QuickStatusButtons({ leadId, etapa }: { leadId: string; etapa: EtapaLead }) {
  const [isPending, startTransition] = useTransition();

  if (etapa === "FECHADO" || etapa === "PERDIDO") return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateLeadEtapa(leadId, "PERDIDO" as EtapaLead))}
        className="btn-secondary border-danger/40 text-danger hover:bg-danger/10"
      >
        <XCircle size={15} />
        Perdido
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateLeadEtapa(leadId, "FECHADO" as EtapaLead))}
        className="btn-primary bg-success text-white hover:opacity-90"
      >
        <CheckCircle2 size={15} />
        Marcar como fechado
      </button>
    </div>
  );
}
