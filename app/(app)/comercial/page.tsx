import { prisma } from "@/app/lib/prisma";
import { NewLeadForm } from "./NewLeadForm";
import { LeadCard } from "./LeadCard";
import { ComercialFiltros } from "./ComercialFiltros";
import { ETAPAS } from "./constants";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Money } from "@/app/components/ui/Money";
import { Prisma, Temperatura } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  responsavel?: string;
  origem?: string;
  temperatura?: string;
  cidade?: string;
  segmento?: string;
};

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, responsavel, origem, temperatura, cidade, segmento } = await searchParams;

  const where: Prisma.LeadWhereInput = {};
  if (responsavel) where.responsavelId = responsavel;
  if (origem) where.origem = origem;
  if (temperatura) where.temperatura = temperatura as Temperatura;
  if (cidade || segmento || q) {
    where.empresa = {
      ...(cidade && { cidade }),
      ...(segmento && { segmento }),
      ...(q && { nome: { contains: q, mode: "insensitive" } }),
    };
  }

  const [leads, usuarios, empresas] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { empresa: true, contato: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.usuario.findMany({ orderBy: { nome: "asc" } }),
    prisma.empresa.findMany({ select: { cidade: true, segmento: true } }),
  ]);

  const leadsPorEtapa = Object.fromEntries(
    ETAPAS.map((et) => [et.value, leads.filter((l) => l.etapa === et.value)])
  );

  const origens = Array.from(
    new Set((await prisma.lead.findMany({ select: { origem: true } })).map((l) => l.origem).filter(Boolean))
  ) as string[];
  const cidades = Array.from(new Set(empresas.map((e) => e.cidade).filter(Boolean))) as string[];
  const segmentos = Array.from(new Set(empresas.map((e) => e.segmento).filter(Boolean))) as string[];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Comercial"
        title="Jornada Comercial"
        subtitle="Do primeiro contato ao fechamento — sem sair dessa tela."
        action={<NewLeadForm />}
      />

      <ComercialFiltros
        responsaveis={usuarios.map((u) => ({ value: u.id, label: u.nome }))}
        origens={origens}
        cidades={cidades}
        segmentos={segmentos}
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPAS.map((et) => {
          const leadsEtapa = leadsPorEtapa[et.value];
          const total = leadsEtapa.reduce((sum, l) => sum + Number(l.valorEstimado ?? 0), 0);
          return (
            <div key={et.value} className="w-72 shrink-0">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${et.dot}`} />
                <span className="font-medium text-foreground">{et.label}</span>
                <span className="ml-auto text-xs text-muted">{leadsEtapa.length}</span>
              </div>
              <div className="mb-3 px-1 text-xs text-muted">
                <Money value={total} />
              </div>
              <div className="flex flex-col gap-2">
                {leadsEtapa.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    id={lead.id}
                    empresaNome={lead.empresa.nome}
                    contatoNome={lead.contato.nome}
                    valorEstimado={lead.valorEstimado?.toString() ?? null}
                    temperatura={lead.temperatura}
                    etapa={lead.etapa}
                    proximaAcao={lead.proximaAcao}
                  />
                ))}
                {leadsEtapa.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted">
                    Solte um lead aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
