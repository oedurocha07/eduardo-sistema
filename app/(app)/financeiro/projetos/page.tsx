import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinanceiroPorProjetoPage() {
  const projetos = await prisma.projeto.findMany({
    include: { cliente: { include: { empresa: true } }, lancamentos: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Rentabilidade por projeto" />
      {projetos.length === 0 ? (
        <EmptyState icon={BarChart3} title="Nenhum projeto com lançamentos ainda" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Receita</th>
                <th className="px-4 py-3 font-medium">Despesa</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((p) => {
                const receita = p.lancamentos
                  .filter((l) => l.tipo === "RECEITA")
                  .reduce((s, l) => s + Number(l.valor), 0);
                const despesa = p.lancamentos
                  .filter((l) => l.tipo === "DESPESA")
                  .reduce((s, l) => s + Number(l.valor), 0);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                    <td className="px-4 py-3 text-muted">{p.cliente.empresa.nome}</td>
                    <td className="px-4 py-3 text-success">
                      <Money value={receita} />
                    </td>
                    <td className="px-4 py-3 text-danger">
                      <Money value={despesa} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Money value={receita - despesa} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
