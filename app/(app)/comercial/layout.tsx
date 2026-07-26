import { SubTabs } from "@/app/components/ui/SubTabs";
import { LeadPopupProvider } from "./LeadPopupContext";
import { LeadPopup } from "./LeadPopup";

const TABS = [
  { href: "/comercial", label: "Jornada" },
  { href: "/comercial/leads", label: "Leads" },
  { href: "/comercial/empresas", label: "Empresas" },
  { href: "/comercial/contatos", label: "Contatos" },
  { href: "/comercial/followups", label: "Follow-ups" },
  { href: "/comercial/agenda", label: "Agenda Comercial" },
];

export default function ComercialLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadPopupProvider>
      <div>
        <SubTabs tabs={TABS} />
        {children}
      </div>
      <LeadPopup />
    </LeadPopupProvider>
  );
}
