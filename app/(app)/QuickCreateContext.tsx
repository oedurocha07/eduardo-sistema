"use client";

import { createContext, useContext, useState } from "react";

export type QuickCreateTipo = "lead" | "lancamento" | "evento" | "cliente" | "proposta";

const QuickCreateContext = createContext<{
  aberto: QuickCreateTipo | null;
  abrir: (tipo: QuickCreateTipo) => void;
  fechar: () => void;
}>({
  aberto: null,
  abrir: () => {},
  fechar: () => {},
});

export function QuickCreateProvider({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState<QuickCreateTipo | null>(null);

  return (
    <QuickCreateContext.Provider
      value={{ aberto, abrir: (tipo) => setAberto(tipo), fechar: () => setAberto(null) }}
    >
      {children}
    </QuickCreateContext.Provider>
  );
}

export function useQuickCreate() {
  return useContext(QuickCreateContext);
}
