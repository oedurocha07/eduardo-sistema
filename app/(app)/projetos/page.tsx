import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewProjetoForm } from "./NewProjetoForm";
import { ProjetoStatusSelect } from "./ProjetoStatusSelect";
import { ArquivarClienteButton } from "./ArquivarClienteButton";
import { DeleteClienteButton } from "./DeleteClienteButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ETAPAS_PRODUCAO } from "./constants";
import { calcularIntervalo, proximoRef, formatarISODate, mesmodia } from "@/app/(app)/agenda/dateUtils";
import { FolderKanban, AlertTriangle, Clock, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

type View = "pipeline" | "semana" | "lista";

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; data?: string; arquivados?: string }>;
}) {
  const { view: viewRaw, data: dataRaw, arquivados } = await searchParams;
  const view: View = viewRaw === "semana" || viewRaw === "lista" ? viewRaw : "pipeline";
  const hoje = new Date();
  const ref = dataRaw ? new Date(`${dataRaw}T00:00:00`) : hoje;
  const mostrarArquivados = arquivados === "1";

  const [clientes, projetos] = await Promise.all([
    prisma.cliente.findMany({
      where: { ativo: !mostrarArquivados },
      include: { empresa: true, projetos: { include: { tarefas: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.projeto.findMany({
      include: { cliente: { include: { empresa: true } }, tarefas: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  const ativas = projetos.filter((p) => p.status !== "CONCLUIDA").length;
  const emRevisao = projetos.filter((p) => p.status === "REVISAO").length;
  const entregasProximas = projetos.filter(
    (p) => p.status !== "CONCLUIDA" && p.dataEntrega && p.dataEntrega >= hoje && p.dataEntrega <= em7dias
  ).length;
  const todasTarefas = projetos.flatMap((p) => p.tarefas);
  const tarefasAtrasadas = todasTarefas.filter((t) => !t.concluida && t.prazo && t.prazo < hoje).length;

  const clientesAtivosTodos = await prisma.cliente.count({ where: { ativo: true } });
  const clientesArquivados = await prisma.cliente.count({ where: { ativo: false } });

  const projetosPorEtapa = Object.fromEntries(
    ETAPAS_PRODUCAO.map((et) => [et.value, projetos.filter((p) => p.status === et.value)])
  );

  const { inicio, fim } = view === "semana" ? calcularIntervalo("semana", ref) : { inicio: ref, fim: ref };
  const tarefasComPrazo = todasTarefas.filter((t) => t.prazo);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Base Freelance"
        subtitle="Sistema de produção — cada cliente, do briefing à entrega."
        action={<NewProjetoForm clientes={clientes.map((c) => ({ id: c.id, nome: c.empresa.nome }))} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Produções ativas" value={ativas} icon={FolderKanban} />
        <StatCard label="Tarefas atrasadas" value={tarefasAtrasadas} icon={AlertTriangle} tone={tarefasAtrasadas > 0 ? "danger" : "default"} />
        <StatCard label="Em revisão" value={emRevisao} icon={Clock} />
        <StatCard label="Entregas próximas" value={entregasProximas} icon={CalendarCheck} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">{mostrarArquivados ? "Clientes arquivados" : "Clientes ativos"}</h2>
          <p className="text-sm text-muted">Clique para abrir o workspace do cliente.</p>
        </div>
        <Link
          href={mostrarArquivados ? "/projetos" : "/projetos?arquivados=1"}
          className="btn-secondary"
        >
          {mostrarArquivados ? `Ativos (${clientesAtivosTodos})` : `Arquivados (${clientesArquivados})`}
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="mb-8">
          <EmptyState icon={FolderKanban} title={mostrarArquivados ? "Nenhum cliente arquivado" : "Nenhum cliente ainda"} description="Feche um lead no Comercial para criar um cliente." />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => {
            const projetosAtivos = c.projetos.filter((p) => p.status !== "CONCLUIDA").length;
            const tarefasAbertas = c.projetos.flatMap((p) => p.tarefas).filter((t) => !t.concluida).length;
            return (
              <div key={c.id} className="card group relative">
                <Link href={`/projetos/${c.id}`} className="block">
                  <div className="font-medium text-foreground">{c.empresa.nome}</div>
                  <div className="mt-1 text-xs text-muted">{projetosAtivos} projeto(s) ativo(s)</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted">{tarefasAbertas} tarefa(s) abertas</span>
                    <span className="text-accent-hover">Abrir →</span>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArquivarClienteButton id={c.id} ativo={c.ativo} />
                  <DeleteClienteButton id={c.id} nome={c.empresa.nome} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
        {(["pipeline", "semana", "lista"] as View[]).map((v) => (
          <Link
            key={v}
            href={`/projetos?view=${v}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              view === v ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"
            }`}
          >
            {v}
          </Link>
        ))}
      </div>

      {view === "pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS_PRODUCAO.map((et) => {
            const doEtapa = projetosPorEtapa[et.value];
            return (
              <div key={et.value} className="w-64 shrink-0">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${et.dot}`} />
                  <span className="font-medium text-foreground">{et.label}</span>
                  <span className="ml-auto text-xs text-muted">{doEtapa.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {doEtapa.map((p) => (
                    <Link key={p.id} href={`/projetos/${p.clienteId}/${p.id}`} className="card block p-3 hover:border-accent/50">
                      <div className="truncate text-sm font-medium text-foreground">{p.nome}</div>
                      <div className="truncate text-xs text-muted">{p.cliente.empresa.nome}</div>
                    </Link>
                  ))}
                  {doEtapa.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted">
                      Nenhuma produção nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "lista" && (
        <div>
          {projetos.length === 0 ? (
            <EmptyState icon={FolderKanban} title="Nenhum projeto encontrado" />
          ) : (
            <div className="flex flex-col gap-2">
              {projetos.map((p) => (
                <div key={p.id} className="card flex items-center gap-3">
                  <Link href={`/projetos/${p.clienteId}/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                      <FolderKanban size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground group-hover:text-accent-hover">{p.nome}</div>
                      <div className="truncate text-sm text-muted">
                        {p.cliente.empresa.nome}
                        {p.dataEntrega && <> · Entrega {p.dataEntrega.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</>}
                      </div>
                    </div>
                  </Link>
                  <div className="w-40 shrink-0">
                    <ProjetoStatusSelect id={p.id} status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "semana" && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Link href={`/projetos?view=semana&data=${formatarISODate(proximoRef("semana", ref, -1))}`} className="btn-secondary !p-2">
              <ChevronLeft size={15} />
            </Link>
            <Link href={`/projetos?view=semana&data=${formatarISODate(hoje)}`} className="btn-secondary">
              Hoje
            </Link>
            <Link href={`/projetos?view=semana&data=${formatarISODate(proximoRef("semana", ref, 1))}`} className="btn-secondary !p-2">
              <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const dia = new Date(inicio);
              dia.setDate(dia.getDate() + i);
              const doDia = tarefasComPrazo.filter((t) => t.prazo && mesmodia(t.prazo, dia));
              const isHoje = mesmodia(dia, hoje);
              return (
                <div key={i} className="min-h-[120px]">
                  <div className="mb-2 text-xs text-muted uppercase">
                    {dia.toLocaleDateString("pt-BR", { weekday: "short" })}{" "}
                    <span className={`font-semibold ${isHoje ? "text-accent-hover" : "text-foreground"}`}>{dia.getDate()}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {doDia.length === 0 && <p className="text-xs text-muted">Sem ações planejadas</p>}
                    {doDia.map((t) => (
                      <div key={t.id} className="rounded-lg bg-surface-hover px-2 py-1.5 text-xs text-foreground">
                        {t.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
