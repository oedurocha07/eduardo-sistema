"use client";

import { createContext, useContext, useState } from "react";

const LeadPopupContext = createContext<{
  leadId: string | null;
  abrirLead: (id: string) => void;
  fecharLead: () => void;
}>({
  leadId: null,
  abrirLead: () => {},
  fecharLead: () => {},
});

export function LeadPopupProvider({ children }: { children: React.ReactNode }) {
  const [leadId, setLeadId] = useState<string | null>(null);

  return (
    <LeadPopupContext.Provider value={{ leadId, abrirLead: setLeadId, fecharLead: () => setLeadId(null) }}>
      {children}
    </LeadPopupContext.Provider>
  );
}

export function useLeadPopup() {
  return useContext(LeadPopupContext);
}
