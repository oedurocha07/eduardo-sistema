import { prisma } from "@/app/lib/prisma";
import { NewOrcamentoForm } from "./NewOrcamentoForm";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { Calculator, Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const orcamentos = await prisma.orcamento.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Orçamentos Inteligentes"
        subtitle="Informe o custo estimado e a margem — o sistema calcula preço e lucro automaticamente."
        action={<NewOrcamentoForm />}
      />

      {orcamentos.length === 0 ? (
        <EmptyState icon={Calculator} title="Nenhum orçamento criado ainda" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Lucro</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{o.tipo}</td>
                  <td className="px-4 py-3 text-muted">{o.descricao ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    <Money value={Number(o.custoEstimado)} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <Money value={Number(o.precoEstimado)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-success">
                    <Money value={Number(o.lucroEstimado)} />
                  </td>
                  <td className="px-4 py-3">
                    {o.arquivoUrl && (
                      <a
                        href={o.arquivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-accent-hover"
                        title="Ver anexo"
                      >
                        <Paperclip size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
