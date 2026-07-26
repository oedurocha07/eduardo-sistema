import {
  Users,
  Wallet,
  FolderKanban,
  TrendingUp,
  FileText,
  Calculator,
  Calendar,
  FileSignature,
  UserSquare2,
} from "lucide-react";

export const DASHBOARD_MODULES = {
  comercial: { href: "/comercial", label: "Comercial", description: "Funil de leads e oportunidades", icon: Users },
  financeiro: { href: "/financeiro", label: "Financeiro", description: "Receitas, despesas e contas", icon: Wallet },
  projetos: { href: "/projetos", label: "Clientes", description: "Produção por cliente", icon: FolderKanban },
  performance: { href: "/performance", label: "Performance", description: "Saúde geral do negócio", icon: TrendingUp },
  propostas: { href: "/propostas", label: "Propostas", description: "Propostas comerciais", icon: FileText },
  orcamentos: { href: "/orcamentos", label: "Orçamentos", description: "Cálculo de custo e preço", icon: Calculator },
  agenda: { href: "/agenda", label: "Agenda", description: "Compromissos e entregas", icon: Calendar },
  contratos: { href: "/contratos", label: "Contratos", description: "Documentos e assinaturas", icon: FileSignature },
  clientes: { href: "/clientes", label: "Base de Clientes", description: "Cadastro de clientes recorrentes", icon: UserSquare2 },
} as const;

export type DashboardModuleKey = keyof typeof DASHBOARD_MODULES;

export const DASHBOARD_MODULE_KEYS = Object.keys(DASHBOARD_MODULES) as DashboardModuleKey[];

export function isDashboardModuleKey(key: string): key is DashboardModuleKey {
  return key in DASHBOARD_MODULES;
}
