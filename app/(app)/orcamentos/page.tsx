import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createOrcamento } from "./actions";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { Badge } from "@/app/components/ui/Badge";
import { ConfiguracaoPrecosModal } from "./ConfiguracaoPrecosModal";
import { CATEGORIAS_ORCAMENTO } from "./constants";
import { Calculator, ArrowRight, Bookmark } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const [orcamentos, templates, catalogo] = await Promise.all([
    prisma.orcamento.findMany({
      where: { isTemplate: false },
      include: { lead: { include: { empresa: true } }, cliente: { include: { empresa: true } }, itens: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orcamento.findMany({
      where: { isTemplate: true },
      include: { itens: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.itemCatalogo.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  function precoSugerido(o: { itens: { custoUnitario: unknown; quantidade: number }[]; margemPercentual: unknown }) {
    const custo = o.itens.reduce((s, i) => s + Number(i.custoUnitario) * i.quantidade, 0);
    const margem = Number(o.margemPercentual) / 100;
    return margem < 1 ? custo / (1 - margem) : custo;
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Propostas que vendem o projeto"
        title="O que você deseja orçar hoje?"
        subtitle="Escolha uma categoria e o sistema monta a estrutura certa."
        action={
          <ConfiguracaoPrecosModal
            itens={catalogo.map((i) => ({
              id: i.id,
              nome: i.nome,
              categoria: i.categoria,
              unidade: i.unidade,
              precoBase: Number(i.precoBase),
            }))}
          />
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIAS_ORCAMENTO.map((cat) => (
          <form key={cat.valor} action={createOrcamento}>
            <input type="hidden" name="nome" value={cat.valor} />
            <input type="hidden" name="categoria" value={cat.valor} />
            <button type="submit" className="card group flex w-full flex-col items-start gap-1 text-left hover:border-accent/50">
              <span className="font-semibold text-foreground">{cat.valor}</span>
              <span className="text-xs text-muted">{cat.descricao}</span>
              <span className="mt-2 flex items-center gap-1 text-xs text-accent-hover">
                Começar
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </form>
        ))}
      </div>

      {templates.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
            <Bookmark size={14} /> Templates
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Link key={t.id} href={`/orcamentos/${t.id}`} className="card hover:border-accent/50">
                <div className="font-medium text-foreground">{t.nome}</div>
                <div className="text-xs text-muted">{t.itens.length} item(ns)</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-muted uppercase">Orçamentos</h2>
      {orcamentos.length === 0 ? (
        <EmptyState icon={Calculator} title="Nenhum orçamento criado ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {orcamentos.map((o) => (
            <Link key={o.id} href={`/orcamentos/${o.id}`} className="card group flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-accent-hover">
                  {o.nome}
                  <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="text-sm text-muted">
                  {o.categoria}
                  {(o.lead?.empresa.nome ?? o.cliente?.empresa.nome) && <> · {o.lead?.empresa.nome ?? o.cliente?.empresa.nome}</>}
                </div>
              </div>
              <div className="text-right">
                <Money value={precoSugerido(o)} className="font-semibold text-foreground" />
                <div className="mt-0.5">
                  <Badge tone="neutral">{o.itens.length} item(ns)</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
