import { getCurrentUser } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { Sidebar } from "./Sidebar";
import { MoneyVisibilityProvider } from "@/app/components/MoneyVisibilityContext";
import { QuickCreateProvider } from "./QuickCreateContext";
import { QuickCreateModals } from "./QuickCreateModals";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const [leads, clientes] = await Promise.all([
    prisma.lead.findMany({ include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <MoneyVisibilityProvider>
      <QuickCreateProvider>
        <div className="flex h-screen flex-col overflow-hidden md:flex-row">
          <Sidebar userName={usuario.nome} />
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
        <QuickCreateModals
          leads={leads.map((l) => ({ id: l.id, label: l.empresa.nome }))}
          clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
        />
      </QuickCreateProvider>
    </MoneyVisibilityProvider>
  );
}
