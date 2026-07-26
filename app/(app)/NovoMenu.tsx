"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Users, Wallet, Calendar, Building2, FileText } from "lucide-react";
import { useQuickCreate, QuickCreateTipo } from "./QuickCreateContext";

const OPCOES: { tipo: QuickCreateTipo; label: string; icon: typeof Users }[] = [
  { tipo: "lead", label: "Novo lead", icon: Users },
  { tipo: "lancamento", label: "Novo lançamento", icon: Wallet },
  { tipo: "evento", label: "Novo evento", icon: Calendar },
  { tipo: "cliente", label: "Novo cliente", icon: Building2 },
  { tipo: "proposta", label: "Nova proposta", icon: FileText },
];

export function NovoMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { abrir } = useQuickCreate();

  useEffect(() => {
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, []);

  return (
    <div ref={ref} className="relative px-3 pb-3">
      <button onClick={() => setOpen((v) => !v)} className="btn-primary w-full">
        <Plus size={16} />
        Novo
      </button>
      {open && (
        <div className="absolute top-full right-3 left-3 z-20 mt-1 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {OPCOES.map((op) => {
            const Icon = op.icon;
            return (
              <button
                key={op.tipo}
                onClick={() => {
                  setOpen(false);
                  abrir(op.tipo);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
              >
                <Icon size={15} className="text-muted" />
                {op.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
