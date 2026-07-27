import { getCurrentUser } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getConfiguracao } from "@/app/lib/configuracao";
import { Sidebar } from "./Sidebar";
import { MoneyVisibilityProvider } from "@/app/components/MoneyVisibilityContext";
import { QuickCreateProvider } from "./QuickCreateContext";
import { QuickCreateModals } from "./QuickCreateModals";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const [clientesRecorrentes, clientes, projetos, config] = await Promise.all([
    prisma.clienteRecorrente.findMany({ where: { status: { not: "ENCERRADO" } }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.projeto.findMany({ select: { id: true, nome: true, clienteId: true } }),
    getConfiguracao(),
  ]);

  return (
    <MoneyVisibilityProvider>
      <QuickCreateProvider>
        <div className="flex h-screen flex-col overflow-hidden md:flex-row">
          <Sidebar userName={usuario.nome} nomeProdutora={config.nomeProdutora ?? "Avra Produtora LTDA"} logoUrl={config.logoUrl} />
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
        <QuickCreateModals
          clientesRecorrentes={clientesRecorrentes.map((c) => ({ id: c.id, label: c.nome }))}
          clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          projetos={projetos}
        />
      </QuickCreateProvider>
    </MoneyVisibilityProvider>
  );
}
