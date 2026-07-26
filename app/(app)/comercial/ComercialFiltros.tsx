"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type Opcao = { value: string; label: string };

export function ComercialFiltros({
  responsaveis,
  origens,
  cidades,
  segmentos,
}: {
  responsaveis: Opcao[];
  origens: string[];
  cidades: string[];
  segmentos: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    router.push(`/comercial?${params.toString()}`);
  }

  const temFiltro = ["responsavel", "origem", "temperatura", "cidade", "segmento", "q"].some((k) =>
    searchParams.get(k)
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        defaultValue={searchParams.get("q") ?? ""}
        onKeyDown={(e) => e.key === "Enter" && atualizar("q", e.currentTarget.value)}
        onBlur={(e) => atualizar("q", e.currentTarget.value)}
        placeholder="Buscar empresa ou contato…"
        className="input max-w-56"
      />
      <select
        value={searchParams.get("responsavel") ?? ""}
        onChange={(e) => atualizar("responsavel", e.target.value)}
        className="input max-w-40"
      >
        <option value="">Responsável: Todos</option>
        {responsaveis.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("origem") ?? ""}
        onChange={(e) => atualizar("origem", e.target.value)}
        className="input max-w-40"
      >
        <option value="">Origem: Todas</option>
        {origens.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("temperatura") ?? ""}
        onChange={(e) => atualizar("temperatura", e.target.value)}
        className="input max-w-40"
      >
        <option value="">Temperatura: Todas</option>
        <option value="FRIO">Frio</option>
        <option value="MORNO">Morno</option>
        <option value="QUENTE">Quente</option>
      </select>
      <select
        value={searchParams.get("cidade") ?? ""}
        onChange={(e) => atualizar("cidade", e.target.value)}
        className="input max-w-40"
      >
        <option value="">Cidade: Todas</option>
        {cidades.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("segmento") ?? ""}
        onChange={(e) => atualizar("segmento", e.target.value)}
        className="input max-w-40"
      >
        <option value="">Segmento: Todos</option>
        {segmentos.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {temFiltro && (
        <button onClick={() => router.push("/comercial")} className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
          <X size={12} /> limpar filtros
        </button>
      )}
    </div>
  );
}
