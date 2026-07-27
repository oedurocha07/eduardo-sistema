import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { getConfiguracao } from "@/app/lib/configuracao";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { RelogioSaoPaulo } from "@/app/components/ui/RelogioSaoPaulo";
import { StatCard } from "@/app/components/ui/StatCard";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { ReceitaDespesaChart } from "@/app/components/dashboard/ReceitaDespesaChart";
import { MiniCalendar } from "@/app/components/dashboard/MiniCalendar";
import { QuickLinksEditor } from "@/app/components/dashboard/QuickLinksEditor";
import { isDashboardModuleKey, DashboardModuleKey } from "@/app/lib/dashboardModules";
import { ETAPAS } from "@/app/(app)/comercial/constants";
import {
  Wallet,
  FolderKanban,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  CalendarClock,
  ArrowRight,
  Flame,
  ListChecks,
  Sun,
} from "lucide-react";

export const dynamic = "force-dynamic";

const MESES_GRAFICO = 6;

export default async function Home() {
  const usuario = await getCurrentUser();
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const inicioGrafico = new Date(now.getFullYear(), now.getMonth() - (MESES_GRAFICO - 1), 1);
  const inicioHoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fimHoje = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [
    lancamentosMes,
    lancamentosGrafico,
    projetosAtivos,
    leadsAbertos,
    funilCounts,
    clientesAtivos,
    config,
    propostasAguardando,
    eventosProximos,
    eventosHoje,
    tarefasPendentes,
  ] = await Promise.all([
    prisma.lancamento.findMany({
      where: { vencimento: { gte: inicioMes, lt: fimMes }, status: "PAGO" },
    }),
    prisma.lancamento.findMany({
      where: { vencimento: { gte: inicioGrafico, lt: fimMes }, status: "PAGO" },
    }),
    prisma.projeto.count({ where: { status: { not: "CONCLUIDA" } } }),
    prisma.lead.findMany({
      where: { etapa: { notIn: ["FECHADO", "PERDIDO"] } },
      include: { empresa: true },
      orderBy: { proximaAcaoEm: "asc" },
    }),
    prisma.lead.groupBy({ by: ["etapa"], _count: { _all: true } }),
    prisma.clienteRecorrente.count({ where: { status: "ATIVO" } }),
    getConfiguracao(),
    prisma.proposta.count({ where: { status: "ENVIADA" } }),
    prisma.evento.findMany({ where: { data: { gte: now } }, orderBy: { data: "asc" }, take: 5 }),
    prisma.evento.findMany({ where: { data: { gte: inicioHoje, lt: fimHoje } }, orderBy: { data: "asc" } }),
    prisma.tarefa.findMany({
      where: { concluida: false },
      include: { projeto: { include: { cliente: { include: { empresa: true } } } } },
      orderBy: { prazo: "asc" },
    }),
  ]);

  const receita = lancamentosMes.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0);
  const despesa = lancamentosMes.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0);
  const lucro = receita - despesa;

  const metaMensal = config.metaMensal ? Number(config.metaMensal) : null;
  const superMetaMensal = config.superMetaMensal ? Number(config.superMetaMensal) : null;
  const escalaMeta = Math.max(metaMensal ?? 0, superMetaMensal ?? 0, receita, 1);
  const pctReceita = Math.min(100, (receita / escalaMeta) * 100);
  const pctMeta = metaMensal ? Math.min(100, (metaMensal / escalaMeta) * 100) : null;
  const pctSuperMeta = superMetaMensal ? Math.min(100, (superMetaMensal / escalaMeta) * 100) : null;
  const progressoMeta = metaMensal && metaMensal > 0 ? Math.min(100, (receita / metaMensal) * 100) : null;

  const atalhos = config.atalhos.filter(isDashboardModuleKey) as DashboardModuleKey[];
  const atalhosFinal = atalhos.length > 0 ? atalhos : (["comercial", "financeiro", "projetos", "performance"] as DashboardModuleKey[]);

  const dadosGrafico = Array.from({ length: MESES_GRAFICO }).map((_, i) => {
    const mesData = new Date(now.getFullYear(), now.getMonth() - (MESES_GRAFICO - 1) + i, 1);
    const proximoMes = new Date(mesData.getFullYear(), mesData.getMonth() + 1, 1);
    const doMes = lancamentosGrafico.filter((l) => l.vencimento >= mesData && l.vencimento < proximoMes);
    return {
      mes: mesData.toLocaleDateString("pt-BR", { month: "short" }),
      receita: doMes.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0),
      despesa: doMes.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0),
    };
  });

  const funil = ETAPAS.map((et) => ({
    ...et,
    total: funilCounts.find((f) => f.etapa === et.value)?._count._all ?? 0,
  }));

  const followUps = leadsAbertos.filter((l) => l.proximaAcaoEm).slice(0, 5);

  const leadsQuentes = leadsAbertos.filter((l) => l.temperatura === "QUENTE");
  const totalLeadsQuentes = leadsQuentes.reduce((s, l) => s + Number(l.valorEstimado ?? 0), 0);

  const hora = now.getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hoje = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-6 md:p-8">
      <p className="mb-1 text-sm text-muted capitalize">{hoje}</p>
      <PageHeader title={`${saudacao}, ${usuario?.nome.split(" ")[0]}.`} titleExtra={<RelogioSaoPaulo />} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Receita do mês" value={<Money value={receita} />} icon={Wallet} tone="success" />
        <StatCard
          label="Lucro do mês"
          value={<Money value={lucro} />}
          icon={TrendingUp}
          tone={lucro >= 0 ? "success" : "danger"}
        />
        <StatCard label="Despesa do mês" value={<Money value={despesa} />} icon={TrendingDown} tone="danger" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Receita x Despesa</h2>
            <span className="text-xs text-muted">Últimos {MESES_GRAFICO} meses</span>
          </div>
          <ReceitaDespesaChart dados={dadosGrafico} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Projetos ativos" value={projetosAtivos} icon={FolderKanban} />
            <StatCard label="Clientes ativos" value={clientesAtivos} icon={Users} />
          </div>
          <div className="card flex flex-1 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted uppercase">Meta do mês</h2>
              <Target size={16} className="text-muted" />
            </div>
            {metaMensal ? (
              <>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    <Money value={receita} />
                  </span>
                  <span className="text-sm text-muted"> / <Money value={metaMensal} /></span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pctReceita}%` }}
                  />
                  {pctMeta !== null && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground/70"
                      style={{ left: `${pctMeta}%` }}
                    />
                  )}
                  {pctSuperMeta !== null && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-success"
                      style={{ left: `${pctSuperMeta}%` }}
                    />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span>{progressoMeta?.toFixed(0)}% da meta</span>
                  {superMetaMensal && (
                    <span className="flex items-center gap-1 text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Super meta <Money value={superMetaMensal} />
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
                <p className="text-sm text-muted">Nenhuma meta definida</p>
                <Link href="/configuracoes" className="text-xs text-accent-hover hover:underline">
                  Definir meta em Configurações
                </Link>
              </div>
            )}
          </div>

          <MiniCalendar />
        </div>
      </div>

      <QuickLinksEditor atalhos={atalhosFinal} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Funil comercial */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Funil comercial</h2>
            <Link href="/comercial" className="text-muted hover:text-accent-hover">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {funil.map((et) => (
              <div key={et.value} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <span className={`h-2 w-2 rounded-full ${et.dot}`} />
                  {et.label}
                </span>
                <span className="font-medium text-foreground">{et.total}</span>
              </div>
            ))}
            {funil.every((et) => et.total === 0) && (
              <p className="text-sm text-muted">Nenhum lead em aberto.</p>
            )}
          </div>
        </div>

        {/* Leads quentes */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <Flame size={14} className="text-danger" /> Leads quentes
            </h2>
            <Link href="/comercial?temperatura=QUENTE" className="text-muted hover:text-accent-hover">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mb-2 text-2xl font-bold text-foreground">
            <Money value={totalLeadsQuentes} />
          </div>
          {leadsQuentes.length === 0 ? (
            <p className="text-sm text-muted">Nenhum lead quente no momento.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leadsQuentes.slice(0, 4).map((l) => (
                <Link
                  key={l.id}
                  href={`/comercial/leads/${l.id}`}
                  className="flex items-center justify-between text-sm hover:text-accent-hover"
                >
                  <span className="min-w-0 truncate text-foreground">{l.empresa.nome}</span>
                  {l.valorEstimado && <Money value={Number(l.valorEstimado)} className="shrink-0 text-xs text-muted" />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Follow-ups pendentes</h2>
            <Link href="/comercial/followups" className="text-muted hover:text-accent-hover">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {followUps.length === 0 && <p className="text-sm text-muted">Nada pendente.</p>}
            {followUps.map((lead) => {
              const atrasado = lead.proximaAcaoEm && lead.proximaAcaoEm < now;
              return (
                <Link
                  key={lead.id}
                  href={`/comercial/leads/${lead.id}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{lead.empresa.nome}</div>
                    <div className="truncate text-xs text-muted">{lead.proximaAcao ?? "Sem ação definida"}</div>
                  </div>
                  {lead.proximaAcaoEm && (
                    <Badge tone={atrasado ? "danger" : "neutral"}>
                      {lead.proximaAcaoEm.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tarefas pendentes */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <ListChecks size={14} /> Tarefas pendentes
            </h2>
            <span className="text-xs text-muted">{tarefasPendentes.length}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {tarefasPendentes.length === 0 && <p className="text-sm text-muted">Tudo em dia!</p>}
            {tarefasPendentes.slice(0, 5).map((t) => {
              const atrasada = t.prazo && t.prazo < now;
              return (
                <Link
                  key={t.id}
                  href={`/projetos/${t.projeto.clienteId}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate text-foreground">{t.titulo}</div>
                    <div className="truncate text-xs text-muted">{t.projeto.cliente.empresa.nome}</div>
                  </div>
                  {t.prazo && (
                    <Badge tone={atrasada ? "danger" : "neutral"}>
                      {t.prazo.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Meu dia */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <Sun size={14} className="text-accent-hover" /> Meu dia
            </h2>
            <span className="text-xs text-muted">{eventosHoje.length} item(ns)</span>
          </div>
          <div className="flex flex-col gap-3">
            {eventosHoje.length === 0 && <p className="text-sm text-muted">Nada agendado para hoje.</p>}
            {eventosHoje.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 text-sm">
                <CalendarClock size={14} className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate text-foreground">{ev.titulo}</span>
                <span className="shrink-0 text-xs text-muted">
                  {ev.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda / próximos */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Agenda</h2>
            <Link href="/agenda" className="text-muted hover:text-accent-hover">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-2">
            <FileText size={15} className="text-accent-hover" />
            <span className="text-sm text-foreground">{propostasAguardando} proposta(s) aguardando</span>
          </div>
          <div className="flex flex-col gap-3">
            {eventosProximos.length === 0 && <p className="text-sm text-muted">Nenhum evento agendado.</p>}
            {eventosProximos.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 text-sm">
                <CalendarClock size={14} className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate text-foreground">{ev.titulo}</span>
                <span className="shrink-0 text-xs text-muted">
                  {ev.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
