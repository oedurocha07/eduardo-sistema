import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { Money } from "@/app/components/ui/Money";
import { DetalhesOrcamentoForm } from "./DetalhesOrcamentoForm";
import { ProducaoStep } from "./ProducaoStep";
import { PosStep } from "./PosStep";
import { ExtrasStep } from "./ExtrasStep";
import { FormacaoPrecoCard } from "./FormacaoPrecoCard";
import { AcoesOrcamento } from "./AcoesOrcamento";
import { AnexoOrcamentoForm } from "./AnexoOrcamentoForm";
import { OrcamentoTabs } from "./OrcamentoTabs";
import { OrcamentoHero } from "./OrcamentoHero";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORIAS_PRODUCAO = ["Equipe", "Equipamento"];
const CATEGORIAS_POS = ["Pós-produção"];

const CHAVES_PRODUCAO = [
  "diaria-captacao",
  "camera-extra",
  "operador-adicional",
  "assistente",
  "drone",
  "drone-fpv",
  "iluminacao",
  "captacao-audio",
  "deslocamento",
];

const CHAVES_POS = [
  "video-entregue",
  "short-reel",
  "hora-motion",
  "hora-color-grading",
  "legendagem",
  "thumbnail",
  "versao-horizontal",
  "versao-vertical",
];

const CHAVES_EXTRAS = [
  "locucao",
  "roteiro",
  "fotografia",
  "cobertura-adicional",
  "hospedagem",
  "alimentacao",
  "direcao-criativa",
  "entrega-urgente",
];

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [orcamento, clientesRecorrentes, clientesFreela, catalogo] = await Promise.all([
    prisma.orcamento.findUnique({
      where: { id },
      include: {
        lead: { include: { empresa: true } },
        cliente: { include: { empresa: true } },
        clienteRecorrente: true,
        itens: { orderBy: { ordem: "asc" } },
      },
    }),
    prisma.clienteRecorrente.findMany({ where: { status: { not: "ENCERRADO" } }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.itemCatalogo.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  if (!orcamento) notFound();

  const alvoAtual = orcamento.clienteRecorrenteId
    ? `clienteRecorrente:${orcamento.clienteRecorrenteId}`
    : orcamento.clienteId
      ? `cliente:${orcamento.clienteId}`
      : "";
  const clienteNome = orcamento.clienteRecorrente?.nome ?? orcamento.cliente?.empresa.nome ?? orcamento.lead?.empresa.nome ?? null;
  const custoOperacional = orcamento.itens.reduce((s, i) => s + Number(i.custoUnitario) * i.quantidade, 0);
  const margemPercentual = Number(orcamento.margemPercentual);
  const margemFrac = margemPercentual / 100;
  const precoSugerido = margemFrac < 1 ? custoOperacional / (1 - margemFrac) : custoOperacional;
  const lucroEstimado = precoSugerido - custoOperacional;

  const catalogoPorId = new Map(catalogo.map((c) => [c.id, c]));

  const itensComInfo = orcamento.itens.map((i) => {
    const cat = i.itemCatalogoId ? catalogoPorId.get(i.itemCatalogoId) : undefined;
    return {
      id: i.id,
      nome: i.nome,
      custoUnitario: Number(i.custoUnitario),
      quantidade: i.quantidade,
      categoria: cat?.categoria ?? null,
      chave: cat?.chave ?? null,
    };
  });

  const catalogoMapeado = catalogo.map((c) => ({
    id: c.id,
    nome: c.nome,
    categoria: c.categoria,
    chave: c.chave,
    unidade: c.unidade,
    precoBase: Number(c.precoBase),
  }));

  // valores atuais dos campos fixos (steppers/toggles), por chave
  const valoresPorChave: Record<string, number> = {};
  for (const item of itensComInfo) {
    if (item.chave) valoresPorChave[item.chave] = item.quantidade;
  }

  const semItens = (arr: typeof itensComInfo) => arr.map((i) => ({ id: i.id, nome: i.nome, custoUnitario: i.custoUnitario, quantidade: i.quantidade }));
  const semCatalogo = (arr: typeof catalogoMapeado) =>
    arr.map((c) => ({ id: c.id, nome: c.nome, categoria: c.categoria, unidade: c.unidade, precoBase: c.precoBase }));

  // Produção: itens/catálogo de Equipe+Equipamento que não têm campo fixo próprio
  const itensProducaoOutros = itensComInfo.filter(
    (i) => i.categoria && CATEGORIAS_PRODUCAO.includes(i.categoria) && !CHAVES_PRODUCAO.includes(i.chave ?? ""),
  );
  const catalogoProducaoOutros = catalogoMapeado.filter(
    (c) => CATEGORIAS_PRODUCAO.includes(c.categoria) && !CHAVES_PRODUCAO.includes(c.chave ?? ""),
  );

  // Pós: itens/catálogo de Pós-produção que não têm campo fixo próprio
  const itensPosOutros = itensComInfo.filter(
    (i) => i.categoria && CATEGORIAS_POS.includes(i.categoria) && !CHAVES_POS.includes(i.chave ?? ""),
  );
  const catalogoPosOutros = catalogoMapeado.filter(
    (c) => CATEGORIAS_POS.includes(c.categoria) && !CHAVES_POS.includes(c.chave ?? ""),
  );

  // Extras: tudo que não é Produção nem Pós (Logística, Extras, ou sem categoria = avulso), sem campo fixo
  const itensExtrasOutros = itensComInfo.filter((i) => {
    const naoProducaoNemPos = !i.categoria || (!CATEGORIAS_PRODUCAO.includes(i.categoria) && !CATEGORIAS_POS.includes(i.categoria));
    return naoProducaoNemPos && !CHAVES_EXTRAS.includes(i.chave ?? "");
  });
  const catalogoExtrasOutros = catalogoMapeado.filter((c) => {
    const naoProducaoNemPos = !CATEGORIAS_PRODUCAO.includes(c.categoria) && !CATEGORIAS_POS.includes(c.categoria);
    return naoProducaoNemPos && !CHAVES_EXTRAS.includes(c.chave ?? "");
  });

  const producaoPreenchida = itensComInfo.some((i) => i.quantidade > 0 && i.categoria !== null && CATEGORIAS_PRODUCAO.includes(i.categoria));
  const posPreenchida = itensComInfo.some((i) => i.quantidade > 0 && i.categoria !== null && CATEGORIAS_POS.includes(i.categoria));
  const extrasPreenchida = itensComInfo.some((i) => {
    const naoProducaoNemPos = !i.categoria || (!CATEGORIAS_PRODUCAO.includes(i.categoria) && !CATEGORIAS_POS.includes(i.categoria));
    return i.quantidade > 0 && naoProducaoNemPos;
  });

  const abas = [
    {
      id: "geral",
      label: "Geral",
      completo: Boolean(orcamento.nome.trim()) && Boolean(alvoAtual),
      content: (
        <DetalhesOrcamentoForm
          orcamentoId={orcamento.id}
          nome={orcamento.nome}
          alvoAtual={alvoAtual}
          clientesRecorrentes={clientesRecorrentes.map((c) => ({ id: c.id, label: c.nome }))}
          clientesFreela={clientesFreela.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          dataPrevista={orcamento.dataPrevista}
          responsavel={orcamento.responsavel}
        />
      ),
    },
    {
      id: "producao",
      label: "Produção",
      completo: producaoPreenchida,
      content: (
        <ProducaoStep
          orcamentoId={orcamento.id}
          valores={valoresPorChave}
          itensOutros={semItens(itensProducaoOutros)}
          catalogoOutros={semCatalogo(catalogoProducaoOutros)}
        />
      ),
    },
    {
      id: "pos",
      label: "Pós",
      completo: posPreenchida,
      content: (
        <PosStep
          orcamentoId={orcamento.id}
          valores={valoresPorChave}
          itensOutros={semItens(itensPosOutros)}
          catalogoOutros={semCatalogo(catalogoPosOutros)}
        />
      ),
    },
    {
      id: "extras",
      label: "Extras",
      completo: extrasPreenchida,
      content: (
        <ExtrasStep
          orcamentoId={orcamento.id}
          valores={valoresPorChave}
          itensOutros={semItens(itensExtrasOutros)}
          catalogoOutros={semCatalogo(catalogoExtrasOutros)}
        />
      ),
    },
    {
      id: "resultado",
      label: "Resultado",
      content: (
        <div className="flex flex-col gap-6">
          <FormacaoPrecoCard
            orcamentoId={orcamento.id}
            custoOperacional={custoOperacional}
            margemPercentual={margemPercentual}
            mostrarDetalhado={orcamento.mostrarDetalhado}
          />

          {itensComInfo.length > 0 && (
            <div className="card">
              <h2 className="mb-1 font-semibold text-foreground">Detalhamento</h2>
              <p className="mb-3 text-xs text-muted">{itensComInfo.length} item(ns)</p>
              <div className="flex flex-col gap-1.5">
                {itensComInfo.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium text-foreground">{item.nome}</div>
                      <div className="text-xs text-muted">
                        {item.categoria ?? "Personalizado"} · {item.quantidade}× <Money value={item.custoUnitario} />
                      </div>
                    </div>
                    <Money value={item.custoUnitario * item.quantidade} className="font-medium text-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnexoOrcamentoForm orcamentoId={orcamento.id} arquivoUrl={orcamento.arquivoUrl} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <Link href="/orcamentos" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para Orçamentos
      </Link>

      <OrcamentoHero
        categoria={orcamento.categoria}
        nome={orcamento.nome}
        clienteNome={clienteNome}
        responsavel={orcamento.responsavel}
        isTemplate={orcamento.isTemplate}
        custoOperacional={custoOperacional}
        margemPercentual={margemPercentual}
        precoSugerido={precoSugerido}
        lucroEstimado={lucroEstimado}
      />

      <div className="mb-4">
        <AcoesOrcamento orcamentoId={orcamento.id} temCliente={Boolean(orcamento.clienteId)} isTemplate={orcamento.isTemplate} />
      </div>

      <OrcamentoTabs abas={abas} />
    </div>
  );
}
