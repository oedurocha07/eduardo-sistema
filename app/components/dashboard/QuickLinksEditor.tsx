"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Settings2, X, Check, ArrowRight } from "lucide-react";
import { DASHBOARD_MODULES, DASHBOARD_MODULE_KEYS, DashboardModuleKey } from "@/app/lib/dashboardModules";
import { updateAtalhos } from "@/app/(app)/actions";

export function QuickLinksEditor({ atalhos }: { atalhos: DashboardModuleKey[] }) {
  const [editando, setEditando] = useState(false);
  const [selecionados, setSelecionados] = useState<DashboardModuleKey[]>(atalhos);
  const [pending, startTransition] = useTransition();

  function alternar(chave: DashboardModuleKey) {
    setSelecionados((prev) =>
      prev.includes(chave) ? prev.filter((c) => c !== chave) : [...prev, chave]
    );
  }

  function salvar() {
    startTransition(async () => {
      await updateAtalhos(selecionados);
      setEditando(false);
    });
  }

  if (editando) {
    return (
      <div className="card mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted uppercase">Personalizar acesso rápido</h2>
          <button onClick={() => setEditando(false)} className="btn-ghost !p-1">
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DASHBOARD_MODULE_KEYS.map((chave) => {
            const modulo = DASHBOARD_MODULES[chave];
            const Icon = modulo.icon;
            const ativo = selecionados.includes(chave);
            return (
              <button
                key={chave}
                type="button"
                onClick={() => alternar(chave)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  ativo
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface text-muted hover:border-border"
                }`}
              >
                <Icon size={15} />
                <span className="flex-1">{modulo.label}</span>
                {ativo && <Check size={14} className="text-accent-hover" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={salvar}
          disabled={pending || selecionados.length === 0}
          className="btn-primary mt-4 w-fit"
        >
          {pending ? "Salvando..." : "Salvar atalhos"}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase">Acesso rápido</h2>
        <button
          onClick={() => {
            setSelecionados(atalhos);
            setEditando(true);
          }}
          className="btn-ghost flex items-center gap-1.5 !px-2 !py-1 text-xs"
        >
          <Settings2 size={13} /> Personalizar
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {atalhos.map((chave) => {
          const modulo = DASHBOARD_MODULES[chave];
          const Icon = modulo.icon;
          return (
            <Link
              key={chave}
              href={modulo.href}
              className="card group flex flex-col gap-3 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent-hover">
                  <Icon size={18} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <div className="font-medium text-foreground">{modulo.label}</div>
                <div className="text-xs text-muted">{modulo.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
