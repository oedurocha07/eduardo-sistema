"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FiltroLancamentos() {
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
    <div className="mb-4 flex flex-wrap gap-2">
      <select
        className="input w-auto"
        value={searchParams.get("tipo") ?? ""}
        onChange={(e) => atualizar("tipo", e.target.value)}
      >
        <option value="">Tipo: Todos</option>
        <option value="RECEITA">Receita</option>
        <option value="DESPESA">Despesa</option>
      </select>
      <select
        className="input w-auto"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => atualizar("status", e.target.value)}
      >
        <option value="">Status: Todos</option>
        <option value="PENDENTE">Pendente</option>
        <option value="PAGO">Pago</option>
      </select>
      <input
        type="month"
        className="input w-auto"
        value={searchParams.get("mes") ?? ""}
        onChange={(e) => atualizar("mes", e.target.value)}
      />
    </div>
  );
}
