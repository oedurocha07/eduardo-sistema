"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FiltroPropostas() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      type="month"
      className="input w-auto"
      value={searchParams.get("mes") ?? ""}
      onChange={(e) => atualizar("mes", e.target.value)}
      title="Filtrar por mês de envio"
    />
  );
}
