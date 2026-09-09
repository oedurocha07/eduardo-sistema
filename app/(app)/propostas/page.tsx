import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewPropostaForm } from "./NewPropostaForm";
import { PropostaStatusSelect } from "./PropostaStatusSelect";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { FileText, Paperclip, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusProposta } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type GrupoStatus = "abertas" | "fechadas" | "perdidas";

const STATUS_POR_GRUPO: Record<GrupoStatus, StatusProposta[]> = {
  abertas: ["RASCUNHO", "ENVIADA"],
  fechadas: ["APROVADA"],
  perdidas: ["RECUSADA"],
};

export default async function PropostasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mes?: string }>;
}) {
  const { status: statusRaw, mes } = await searchParams;
  const grupo: GrupoStatus = statusRaw === "fechadas" || statusRaw === "perdidas" ? statusRaw : "abertas";

  const now = new Date();
  // Proposta.enviadaEm é um timestamp real (new Date() no momento em que a proposta é
  // marcada como Enviada, ver actions.ts) — diferente de campos "literais" como
  // Lancamento.vencimento. Por isso aqui a fronteira do mês fica no fuso local do
  // container (America/Sao_Paulo), igual a qualquer timestamp real.
  let ref = now;
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [ano, mesNum] = mes.split("-").map(Number);
    ref = new Date(ano, mesNum - 1, 1);
  }
  const inicioMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const fimMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  const mesAnteriorParam = (() => {
    const anterior = new Date(ref);
    anterior.setMonth(anterior.getMonth() - 1);
    return `${anterior.getFullYear()}-${String(anterior.getMonth() + 1).padStart(2, "0")}`;
  })();
  const mesSeguinteParam = (() => {
    const seguinte = new Date(ref);
    seguinte.setMonth(seguinte.getMonth() + 1);
    return `${seguinte.getFullYear()}-${String(seguinte.getMonth() + 1).padStart(2, "0")}`;
  })();
  const estaNoMesAtual = ref.getFullYear() === now.getFullYear() && ref.getMonth() === now.getMonth();
  const mesLabel = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const [propostas, clientesRecorrentes, clientesFreela] = await Promise.all([
    prisma.proposta.findMany({
      include: { clienteRecorrente: true, cliente: { include: { empresa: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clienteRecorrente.findMany({ where: { status: { not: "ENCERRADO" } }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true } }),
  ]);

  const porGrupo = (g: GrupoStatus) => propostas.filter((p) => STATUS_POR_GRUPO[g].includes(p.status));

  // Propostas sem enviadaEm (rascunhos ainda não enviados) não têm mês pra agrupar —
  // ficam sempre visíveis, independente do mês selecionado.
  const noMes = (p: (typeof propostas)[number]) =>
    !p.enviadaEm || (p.enviadaEm >= inicioMes && p.enviadaEm < fimMes);

  const propostasFiltradas = porGrupo(grupo).filter(noMes);

  const TABS: { value: GrupoStatus; label: string }[] = [
    { value: "abertas", label: `Abertas (${porGrupo("abertas").filter(noMes).length})` },
    { value: "fechadas", label: `Fechadas (${porGrupo("fechadas").filter(noMes).length})` },
    { value: "perdidas", label: `Perdidas (${porGrupo("perdidas").filter(noMes).length})` },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Propostas"
        subtitle="Crie, publique e acompanhe propostas comerciais."
        action={
          <NewPropostaForm
            clientesRecorrentes={clientesRecorrentes.map((c) => ({ id: c.id, label: c.nome }))}
            clientesFreela={clientesFreela.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          />
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/propostas?status=${t.value}${mes ? `&mes=${mes}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                grupo === t.value ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/propostas?status=${grupo}&mes=${mesAnteriorParam}`}
            className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </Link>
          <span className="min-w-32 text-center text-sm font-medium text-foreground capitalize">{mesLabel}</span>
          <Link
            href={`/propostas?status=${grupo}&mes=${mesSeguinteParam}`}
            className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <ChevronRight size={16} />
          </Link>
          {!estaNoMesAtual && (
            <Link href={`/propostas?status=${grupo}`} className="ml-2 text-xs text-accent-hover hover:underline">
              Hoje
            </Link>
          )}
        </div>
      </div>

      {propostasFiltradas.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta encontrada" />
      ) : (
        <div className="flex flex-col gap-2">
          {propostasFiltradas.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center gap-3">
              <Link href={`/propostas/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate font-medium text-foreground group-hover:text-accent-hover">
                    <span className="truncate">{p.titulo}</span>
                    {p.arquivoUrl && (
                      <a
                        href={p.arquivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-muted hover:text-accent-hover"
                        title="Ver anexo"
                      >
                        <Paperclip size={14} />
                      </a>
                    )}
                  </div>
                  <div className="truncate text-sm text-muted">
                    {p.clienteRecorrente?.nome ?? p.cliente?.empresa.nome ?? "—"}
                    {p.valor && (
                      <>
                        {" · "}
                        <Money value={Number(p.valor)} />
                      </>
                    )}
                    {" · "}
                    Enviada em {p.enviadaEm ? p.enviadaEm.toLocaleDateString("pt-BR") : "—"}
                  </div>
                </div>
                <ArrowRight size={13} className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <div className="w-full sm:w-40 sm:shrink-0">
                <PropostaStatusSelect id={p.id} status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
