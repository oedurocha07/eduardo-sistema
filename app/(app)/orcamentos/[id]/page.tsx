import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { DetalhesOrcamentoForm } from "./DetalhesOrcamentoForm";
import { ItensOrcamentoSection } from "./ItensOrcamentoSection";
import { FormacaoPrecoCard } from "./FormacaoPrecoCard";
import { AcoesOrcamento } from "./AcoesOrcamento";
import { AnexoOrcamentoForm } from "./AnexoOrcamentoForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [orcamento, leads, clientes, catalogo] = await Promise.all([
    prisma.orcamento.findUnique({
      where: { id },
      include: {
        lead: { include: { empresa: true } },
        cliente: { include: { empresa: true } },
        itens: { orderBy: { ordem: "asc" } },
      },
    }),
    prisma.lead.findMany({ include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.itemCatalogo.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  if (!orcamento) notFound();

  const alvoAtual = orcamento.leadId ? `lead:${orcamento.leadId}` : orcamento.clienteId ? `cliente:${orcamento.clienteId}` : "";
  const custoOperacional = orcamento.itens.reduce((s, i) => s + Number(i.custoUnitario) * i.quantidade, 0);

  return (
    <div className="p-6 md:p-8">
      <Link href="/orcamentos" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para Orçamentos
      </Link>

      <PageHeader
        eyebrow={orcamento.categoria}
        title={orcamento.nome}
        action={orcamento.isTemplate ? <Badge tone="accent">Template</Badge> : undefined}
      />

      <div className="flex flex-col gap-6">
        <DetalhesOrcamentoForm
          orcamentoId={orcamento.id}
          nome={orcamento.nome}
          alvoAtual={alvoAtual}
          leads={leads.map((l) => ({ id: l.id, label: l.empresa.nome }))}
          clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
        />

        <ItensOrcamentoSection
          orcamentoId={orcamento.id}
          itens={orcamento.itens.map((i) => ({ id: i.id, nome: i.nome, custoUnitario: Number(i.custoUnitario), quantidade: i.quantidade }))}
          catalogo={catalogo.map((c) => ({
            id: c.id,
            nome: c.nome,
            categoria: c.categoria,
            unidade: c.unidade,
            precoBase: Number(c.precoBase),
          }))}
        />

        <FormacaoPrecoCard
          orcamentoId={orcamento.id}
          custoOperacional={custoOperacional}
          margemPercentual={Number(orcamento.margemPercentual)}
          mostrarDetalhado={orcamento.mostrarDetalhado}
        />

        <AnexoOrcamentoForm orcamentoId={orcamento.id} arquivoUrl={orcamento.arquivoUrl} />

        <AcoesOrcamento orcamentoId={orcamento.id} temCliente={Boolean(orcamento.clienteId)} isTemplate={orcamento.isTemplate} />
      </div>
    </div>
  );
}
