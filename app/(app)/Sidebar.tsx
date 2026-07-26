"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Wallet,
  FileText,
  Calculator,
  Calendar,
  CalendarRange,
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { AvraLogo } from "@/app/components/AvraLogo";
import { useMoneyVisibility } from "@/app/components/MoneyVisibilityContext";
import { NovoMenu } from "./NovoMenu";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/comercial", label: "Comercial", icon: Users },
  { href: "/clientes", label: "Base de Clientes", icon: Building2 },
  { href: "/projetos", label: "Clientes", icon: FolderKanban },
  { href: "/eventos", label: "Eventos", icon: CalendarRange },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/propostas", label: "Propostas", icon: FileText },
  { href: "/orcamentos", label: "Orçamentos", icon: Calculator },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/contratos", label: "Contratos", icon: Shield },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hidden, toggle } = useMoneyVisibility();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <AvraLogo className="h-6 w-9 shrink-0" />
        <span className="text-sm leading-tight font-semibold text-foreground">Avra Produtora LTDA</span>
      </div>

      <NovoMenu />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/15 text-accent-hover"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-2 border-t border-border" />

        <Link
          href="/configuracoes"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive("/configuracoes")
              ? "bg-accent/15 text-accent-hover"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          <Settings size={18} />
          Configurações
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={toggle}
          className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
          {hidden ? "Mostrar valores" : "Ocultar valores"}
        </button>
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate text-sm text-muted">{userName}</span>
          <button
            onClick={handleLogout}
            className="text-muted transition-colors hover:text-danger"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <span className="font-semibold text-foreground">Avra Produtora LTDA</span>
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="text-foreground">
            {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-3 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
