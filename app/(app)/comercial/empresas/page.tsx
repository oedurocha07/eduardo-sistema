import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    include: { _count: { select: { leads: true, contatos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Empresas" subtitle={`${empresas.length} empresa${empresas.length === 1 ? "" : "s"}`} />

      {empresas.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma empresa ainda"
          description="Elas aparecem aqui automaticamente quando você cadastra leads."
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium">Contatos</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{empresa.nome}</td>
                  <td className="px-4 py-3 text-muted">{empresa.cidade ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{empresa.segmento ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{empresa._count.leads}</td>
                  <td className="px-4 py-3 text-muted">{empresa._count.contatos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
