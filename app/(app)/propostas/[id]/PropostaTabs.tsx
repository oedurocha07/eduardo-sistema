"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

type Aba = { id: string; label: string; content: React.ReactNode; completo?: boolean };

export function PropostaTabs({ abas, inicial }: { abas: Aba[]; inicial?: string }) {
  const [ativa, setAtiva] = useState(inicial ?? abas[0]?.id);

  return (
    <div>
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1">
        {abas.map((aba, i) => {
          const isAtiva = ativa === aba.id;
          const isCompleta = aba.completo === true;
          return (
            <div key={aba.id} className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAtiva(aba.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isAtiva
                    ? "border-accent bg-accent/10 text-foreground shadow-[0_0_20px_-8px_var(--accent)]"
                    : isCompleta
                      ? "border-green-600/40 bg-green-600/10 text-foreground hover:border-accent/50"
                      : "border-border text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {isCompleta ? (
                  <CircleCheck size={18} className="shrink-0 text-green-600" strokeWidth={1.75} />
                ) : (
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                      isAtiva ? "bg-accent text-white" : "bg-muted/20 text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                {aba.label}
              </button>
              {i < abas.length - 1 && <div className="h-px w-4 shrink-0 bg-border" />}
            </div>
          );
        })}
      </div>
      {abas.find((aba) => aba.id === ativa)?.content}
    </div>
  );
}
