"use client";

import { useTransition } from "react";
import { updateProdutora } from "./actions";
import { AvraLogo } from "@/app/components/AvraLogo";

export function ProdutoraForm({ nomeProdutora, logoUrl }: { nomeProdutora: string; logoUrl: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updateProdutora(formData))}
      encType="multipart/form-data"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={nomeProdutora} className="h-12 w-16 rounded-lg border border-border object-contain p-1" />
        ) : (
          <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-border">
            <AvraLogo className="h-6 w-9" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Ícone / logo</label>
          <input name="logo" type="file" accept="image/*" className="input" />
        </div>
      </div>

      <label className="text-sm text-muted">Nome da produtora</label>
      <input name="nomeProdutora" defaultValue={nomeProdutora} placeholder="Avra Produtora LTDA" className="input" />

      <button type="submit" disabled={isPending} className="btn-primary mt-2 w-fit">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
