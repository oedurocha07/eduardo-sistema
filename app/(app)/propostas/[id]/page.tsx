import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getConfiguracao } from "@/app/lib/configuracao";
import { PropostaTabs } from "./PropostaTabs";
import { PropostaHero } from "./PropostaHero";
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

  const [proposta, clientesRecorrentes, clientesFreela, config] = await Promise.all([
    prisma.proposta.findUnique({
      where: { id },
      include: {
        lead: { include: { empresa: true } },
        cliente: { include: { empresa: true } },
        clienteRecorrente: true,
        itensEscopo: { orderBy: { ordem: "asc" } },
        etapas: { orderBy: { ordem: "asc" } },
      },
    }),
    prisma.clienteRecorrente.findMany({ where: { status: { not: "ENCERRADO" } }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    getConfiguracao(),
  ]);

  if (!proposta) notFound();

  const alvoAtual = proposta.clienteRecorrenteId
    ? `clienteRecorrente:${proposta.clienteRecorrenteId}`
    : proposta.clienteId
      ? `cliente:${proposta.clienteId}`
      : "";
  const clienteNome =
    proposta.clienteRecorrente?.nome ?? proposta.cliente?.empresa.nome ?? proposta.lead?.empresa.nome ?? proposta.nomeEmpresa ?? null;
  const numero = `PROP-${proposta.createdAt.getFullYear()}-${proposta.id.slice(0, 4).toUpperCase()}`;

  const abas = [
    {
      id: "geral",
      label: "Geral",
      completo:
        Boolean(proposta.titulo.trim()) &&
        Boolean(proposta.clienteRecorrenteId || proposta.clienteId || proposta.nomeEmpresa?.trim()),
      content: (
        <div className="flex flex-col gap-6">
          <GeralForm
            propostaId={proposta.id}
            titulo={proposta.titulo}
            alvoAtual={alvoAtual}
            nomeManual={proposta.nomeEmpresa ?? ""}
            clientesRecorrentes={clientesRecorrentes.map((c) => ({ id: c.id, label: c.nome }))}
            clientesFreela={clientesFreela.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          />
          <AnexoPropostaForm propostaId={proposta.id} arquivoUrl={proposta.arquivoUrl} />
        </div>
      ),
    },
    {
      id: "conceito",
      label: "Conceito",
      completo: Boolean(proposta.fraseAbertura?.trim() || proposta.contextoProjeto?.trim()),
      content: (
        <ConceitoForm
          propostaId={proposta.id}
          fraseAbertura={proposta.fraseAbertura}
          contextoProjeto={proposta.contextoProjeto}
        />
      ),
    },
    {
      id: "escopo",
      label: "Escopo",
      completo: proposta.itensEscopo.length > 0,
      content: (
        <EscopoSection
          propostaId={proposta.id}
          itens={proposta.itensEscopo.map((i) => ({
            id: i.id,
            titulo: i.titulo,
            detalhe: i.detalhe,
            custoInterno: i.custoInterno ? Number(i.custoInterno) : null,
          }))}
        />
      ),
    },
    {
      id: "cronograma",
      label: "Cronograma",
      completo: proposta.semCronograma || proposta.etapas.length > 0,
      content: <CronogramaSection propostaId={proposta.id} etapas={proposta.etapas} semCronograma={proposta.semCronograma} />,
    },
    {
      id: "investimento",
      label: "Investimento",
      completo: proposta.valor != null,
      content: (
        <InvestimentoForm
          propostaId={proposta.id}
          valor={proposta.valor ? Number(proposta.valor) : null}
          validade={proposta.validade}
          recorrente={proposta.recorrente}
          parcelamento={proposta.parcelamento}
          condicoesPagamento={proposta.condicoesPagamento}
          itensEscopo={proposta.itensEscopo.map((i) => ({
            id: i.id,
            titulo: i.titulo,
            custoInterno: i.custoInterno ? Number(i.custoInterno) : null,
          }))}
          margemDesejada={proposta.margemDesejada ? Number(proposta.margemDesejada) : null}
          corDestaque={proposta.corDestaque}
        />
      ),
    },
    {
      id: "resultado",
      label: "Resultado",
      content: (
        <ResultadoPreview
          propostaId={proposta.id}
          titulo={proposta.titulo}
          clienteNome={clienteNome}
          nomeProdutora={config.nomeProdutora ?? "Avra Produtora LTDA"}
          logoUrl={config.logoUrl}
          fraseAbertura={proposta.fraseAbertura}
          contextoProjeto={proposta.contextoProjeto}
          itensEscopo={proposta.itensEscopo}
          etapas={proposta.etapas}
          semCronograma={proposta.semCronograma}
          valor={proposta.valor ? Number(proposta.valor) : null}
          recorrente={proposta.recorrente}
          parcelamento={proposta.parcelamento}
          condicoesPagamento={proposta.condicoesPagamento}
          validade={proposta.validade}
          numero={numero}
          corDestaque={proposta.corDestaque}
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

        <PropostaHero
          propostaId={proposta.id}
          numero={numero}
          titulo={proposta.titulo}
          clienteNome={clienteNome}
          status={proposta.status}
          itensEscopoCount={proposta.itensEscopo.length}
          valor={proposta.valor ? Number(proposta.valor) : null}
          recorrente={proposta.recorrente}
          validade={proposta.validade}
        />
      </div>

      <div className="print:hidden">
        <PropostaTabs abas={abas} />
      </div>
      <div className="hidden print:block">{abas.find((a) => a.id === "resultado")?.content}</div>
    </div>
  );
}
