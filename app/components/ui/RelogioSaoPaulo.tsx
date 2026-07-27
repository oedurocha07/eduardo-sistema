"use client";

import { useEffect, useState } from "react";

export function RelogioSaoPaulo() {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    function atualizar() {
      setHora(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      );
    }
    atualizar();
    const intervalo = setInterval(atualizar, 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (!hora) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {hora}
    </span>
  );
}
