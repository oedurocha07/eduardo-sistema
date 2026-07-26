import { SubTabs } from "@/app/components/ui/SubTabs";

const TABS = [
  { href: "/financeiro", label: "Visão geral" },
  { href: "/financeiro/lancamentos", label: "Lançamentos" },
  { href: "/financeiro/contas", label: "Contas" },
  { href: "/financeiro/projetos", label: "Por projeto" },
];

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SubTabs tabs={TABS} />
      {children}
    </div>
  );
}
