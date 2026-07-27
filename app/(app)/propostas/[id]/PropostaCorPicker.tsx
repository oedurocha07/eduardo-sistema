"use client";

import { useState, useTransition } from "react";
import { Check, Ban } from "lucide-react";
import { BRAND_COLORS, BrandColorKey } from "@/app/lib/brandColors";
import { updatePropostaCorDestaque } from "../actions";

export function PropostaCorPicker({ propostaId, corAtual }: { propostaId: string; corAtual: string | null }) {
  const [selecionada, setSelecionada] = useState<BrandColorKey | null>(corAtual as BrandColorKey | null);
  const [isPending, startTransition] = useTransition();

  function escolher(chave: BrandColorKey | null) {
    setSelecionada(chave);
    startTransition(() => updatePropostaCorDestaque(propostaId, chave));
  }

  return (
    <div className="card flex flex-col gap-3">
      <div>
        <h2 className="font-semibold text-foreground">Cor de destaque</h2>
        <p className="text-xs text-muted">Aparece na prévia final da proposta. Sem cor, segue o padrão preto e branco da AVRA.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => escolher(null)}
          className="flex flex-col items-center gap-1.5"
          title="Padrão AVRA (sem cor)"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background"
            style={{ borderColor: selecionada === null ? "var(--foreground)" : "transparent" }}
          >
            {selecionada === null ? <Check size={16} className="text-foreground" /> : <Ban size={14} className="text-muted" />}
          </span>
          <span className="text-xs text-muted">Padrão</span>
        </button>
        {(Object.entries(BRAND_COLORS) as [BrandColorKey, (typeof BRAND_COLORS)[BrandColorKey]][]).map(
          ([chave, cor]) => (
            <button
              key={chave}
              type="button"
              disabled={isPending}
              onClick={() => escolher(chave)}
              className="flex flex-col items-center gap-1.5"
              title={cor.label}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform"
                style={{ backgroundColor: cor.accent, borderColor: selecionada === chave ? cor.accent : "transparent" }}
              >
                {selecionada === chave && <Check size={16} color={cor.foreground} />}
              </span>
              <span className="text-xs text-muted">{cor.label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
