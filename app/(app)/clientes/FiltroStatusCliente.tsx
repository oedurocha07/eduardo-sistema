"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPCOES_RECORRENTE = [
  { value: "", label: "Status: Todos" },
  { value: "ATIVO", label: "Ativo" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "ENCERRADO", label: "Encerrado" },
];

const OPCOES_FREELA = [
  { value: "", label: "Status: Todos" },
  { value: "ATIVO", label: "Em progresso" },
  { value: "ENCERRADO", label: "Encerrado" },
  { value: "PAUSADO", label: "Pausado (legado)" },
];

const OPCOES_TODOS = [
  { value: "", label: "Status: Todos" },
  { value: "ATIVO", label: "Ativo / Em progresso" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "ENCERRADO", label: "Encerrado" },
];

export function FiltroStatusCliente({ tipo }: { tipo: "todos" | "recorrente" | "freela" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const opcoes = tipo === "recorrente" ? OPCOES_RECORRENTE : tipo === "freela" ? OPCOES_FREELA : OPCOES_TODOS;

  function atualizar(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("status", valor);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select className="input w-auto" value={searchParams.get("status") ?? ""} onChange={(e) => atualizar(e.target.value)}>
      {opcoes.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
