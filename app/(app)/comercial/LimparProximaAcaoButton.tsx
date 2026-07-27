"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { limparProximaAcao } from "./actions";

export function LimparProximaAcaoButton({
  leadId,
  size = 15,
  className = "shrink-0 text-muted hover:text-danger",
}: {
  leadId: string;
  size?: number;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Remover follow-up"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => limparProximaAcao(leadId));
      }}
      className={className}
    >
      <X size={size} />
    </button>
  );
}
