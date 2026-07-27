"use client";

import { useEffect, useState, useTransition } from "react";
import { setItemPorChave } from "../actions";

export function StepperField({
  orcamentoId,
  chave,
  label,
  sublabel,
  unidade,
  valorInicial,
}: {
  orcamentoId: string;
  chave: string;
  label: string;
  sublabel?: string;
  unidade?: string;
  valorInicial: number;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValor(valorInicial);
  }, [valorInicial]);

  function commit(v: number) {
    const clamped = Math.max(0, v);
    setValor(clamped);
    startTransition(() => setItemPorChave(orcamentoId, chave, clamped));
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => commit(valor - 1)}
          className="btn-ghost !h-7 !w-7 !p-0 text-lg"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-foreground">{valor}</span>
        {unidade && <span className="text-xs text-muted">{unidade}</span>}
        <button
          type="button"
          disabled={isPending}
          onClick={() => commit(valor + 1)}
          className="btn-ghost !h-7 !w-7 !p-0 text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ToggleField({
  orcamentoId,
  chave,
  label,
  sublabel,
  ativo,
}: {
  orcamentoId: string;
  chave: string;
  label: string;
  sublabel?: string;
  ativo: boolean;
}) {
  const [ligado, setLigado] = useState(ativo);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLigado(ativo);
  }, [ativo]);

  function alternar() {
    const novo = !ligado;
    setLigado(novo);
    startTransition(() => setItemPorChave(orcamentoId, chave, novo ? 1 : 0));
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={alternar}
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        ligado ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
      </div>
      <div
        className={`h-5 w-5 shrink-0 rounded-full border ${ligado ? "border-accent bg-accent" : "border-border"}`}
      />
    </button>
  );
}
