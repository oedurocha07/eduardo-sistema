"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { BRAND_COLORS, BrandColorKey } from "@/app/lib/brandColors";
import { updateCorDestaque } from "./actions";

export function BrandKitPicker({ corAtual }: { corAtual: BrandColorKey }) {
  const [selecionada, setSelecionada] = useState<BrandColorKey>(corAtual);
  const [isPending, startTransition] = useTransition();

  function escolher(chave: BrandColorKey) {
    setSelecionada(chave);
    startTransition(() => updateCorDestaque(chave));
  }

  return (
    <div className="flex flex-wrap gap-3">
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
        )
      )}
    </div>
  );
}
