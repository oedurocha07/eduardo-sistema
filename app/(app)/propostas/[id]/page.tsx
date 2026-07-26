import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { PropostaStatusSelect } from "../PropostaStatusSelect";
import { DeletePropostaButton } from "../DeletePropostaButton";
import { PropostaTabs } from "./PropostaTabs";
import { GeralForm } from "./GeralForm";
import { AnexoPropostaForm } from "./AnexoPropostaForm";
import { ConceitoForm } from "./ConceitoForm";
import { EscopoSection } from "./EscopoSection";
import { CronogramaSection } from "./CronogramaSection";
import { InvestimentoForm } from "./InvestimentoForm";
import { ResultadoPreview } from "./ResultadoPreview";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropostaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [proposta, leads, clientes] = await Promise.all([
    prisma.proposta.findUnique({
      where: { id },
      include: {
        lead: { include: { empresa: true } },
        cliente: { include: { empresa: true } },
        itensEscopo: { orderBy: { ordem: "asc" } },
        etapas: { orderBy: { ordem: "asc" } },
      },
    }),
    prisma.lead.findMany({ include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!proposta) notFound();

  const alvoAtual = proposta.leadId ? `lead:${proposta.leadId}` : proposta.clienteId ? `cliente:${proposta.clienteId}` : "";
  const clienteNome = proposta.lead?.empresa.nome ?? proposta.cliente?.empresa.nome ?? null;
  const numero = `PROP-${proposta.createdAt.getFullYear()}-${proposta.id.slice(0, 4).toUpperCase()}`;

  const abas = [
    {
      id: "geral",
      label: "Geral",
      content: (
        <div className="flex flex-col gap-6">
          <GeralForm
            propostaId={proposta.id}
            titulo={proposta.titulo}
            alvoAtual={alvoAtual}
            leads={leads.map((l) => ({ id: l.id, label: l.empresa.nome }))}
            clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          />
          <AnexoPropostaForm propostaId={proposta.id} arquivoUrl={proposta.arquivoUrl} />
        </div>
      ),
    },
    {
      id: "conceito",
      label: "Conceito",
      content: <ConceitoForm propostaId={proposta.id} conteudo={proposta.conteudo} />,
    },
    {
      id: "escopo",
      label: "Escopo",
      content: <EscopoSection propostaId={proposta.id} itens={proposta.itensEscopo} />,
    },
    {
      id: "cronograma",
      label: "Cronograma",
      content: <CronogramaSection propostaId={proposta.id} etapas={proposta.etapas} />,
    },
    {
      id: "investimento",
      label: "Investimento",
      content: (
        <InvestimentoForm
          propostaId={proposta.id}
          valor={proposta.valor ? Number(proposta.valor) : null}
          validade={proposta.validade}
          recorrente={proposta.recorrente}
          parcelamento={proposta.parcelamento}
          condicoesPagamento={proposta.condicoesPagamento}
        />
      ),
    },
    {
      id: "resultado",
      label: "Resultado",
      content: (
        <ResultadoPreview
          titulo={proposta.titulo}
          clienteNome={clienteNome}
          conteudo={proposta.conteudo}
          itensEscopo={proposta.itensEscopo}
          etapas={proposta.etapas}
          valor={proposta.valor ? Number(proposta.valor) : null}
          recorrente={proposta.recorrente}
          parcelamento={proposta.parcelamento}
          condicoesPagamento={proposta.condicoesPagamento}
          validade={proposta.validade}
          numero={numero}
        />
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 print:p-0">
      <div className="print:hidden">
        <Link href="/propostas" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} />
          Voltar para Propostas
        </Link>

        <PageHeader
          eyebrow={numero}
          title={proposta.titulo}
          action={
            <div className="flex items-center gap-2">
              <PropostaStatusSelect id={proposta.id} status={proposta.status} />
              <DeletePropostaButton id={proposta.id} titulo={proposta.titulo} />
            </div>
          }
        />
      </div>

      <div className="print:hidden">
        <PropostaTabs abas={abas} />
      </div>
      <div className="hidden print:block">{abas.find((a) => a.id === "resultado")?.content}</div>
    </div>
  );
}
