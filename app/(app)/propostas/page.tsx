import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewPropostaForm } from "./NewPropostaForm";
import { PropostaStatusSelect } from "./PropostaStatusSelect";
import { FiltroPropostas } from "./FiltroPropostas";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { FileText, Paperclip, ArrowRight } from "lucide-react";
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

  const [propostas, clientesRecorrentes, clientesFreela] = await Promise.all([
    prisma.proposta.findMany({
      include: { clienteRecorrente: true, cliente: { include: { empresa: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clienteRecorrente.findMany({ where: { status: { not: "ENCERRADO" } }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const porGrupo = (g: GrupoStatus) => propostas.filter((p) => STATUS_POR_GRUPO[g].includes(p.status));

  let propostasFiltradas = porGrupo(grupo);
  if (mes) {
    const [ano, mesNum] = mes.split("-").map(Number);
    const inicio = new Date(ano, mesNum - 1, 1);
    const fim = new Date(ano, mesNum, 1);
    propostasFiltradas = propostasFiltradas.filter(
      (p) => p.enviadaEm && p.enviadaEm >= inicio && p.enviadaEm < fim
    );
  }

  const TABS: { value: GrupoStatus; label: string }[] = [
    { value: "abertas", label: `Abertas (${porGrupo("abertas").length})` },
    { value: "fechadas", label: `Fechadas (${porGrupo("fechadas").length})` },
    { value: "perdidas", label: `Perdidas (${porGrupo("perdidas").length})` },
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
              href={`/propostas?status=${t.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                grupo === t.value ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <FiltroPropostas />
      </div>

      {propostasFiltradas.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta encontrada" />
      ) : (
        <div className="flex flex-col gap-2">
          {propostasFiltradas.map((p) => (
            <div key={p.id} className="card flex items-center gap-3">
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
              <div className="w-40 shrink-0">
                <PropostaStatusSelect id={p.id} status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
