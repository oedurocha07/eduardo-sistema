"use client";

import { useState } from "react";

type Aba = { id: string; label: string; content: React.ReactNode };

export function LeadTabs({ abas }: { abas: Aba[] }) {
  const [ativa, setAtiva] = useState(abas[0]?.id);

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAtiva(aba.id)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              ativa === aba.id
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>
      {abas.find((aba) => aba.id === ativa)?.content}
    </div>
  );
}
