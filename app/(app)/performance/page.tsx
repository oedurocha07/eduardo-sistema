import { prisma } from "@/app/lib/prisma";
import { getConfiguracao } from "@/app/lib/configuracao";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { Money } from "@/app/components/ui/Money";
import { LeadTabs } from "@/app/(app)/comercial/leads/[id]/LeadTabs";
import { ETAPAS } from "@/app/(app)/comercial/constants";
import { ETAPAS_PRODUCAO } from "@/app/(app)/projetos/constants";
import { Wallet, TrendingUp, FolderKanban, Users, Target, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function HealthGauge({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? "var(--success)" : value >= 40 ? "var(--warning)" : "var(--danger)";

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
      <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle
        cx="65"
        cy="65"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="65"
        y="65"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        fill="var(--foreground)"
        fontSize="28"
        fontWeight="bold"
        style={{ transform: "rotate(90deg)", transformOrigin: "65px 65px" }}
      >
        {value}
      </text>
    </svg>
  );
}

function Barra({ label, valor, max, cor }: { label: React.ReactNode; valor: number; max: number; cor: string }) {
  const pct = max > 0 ? (valor / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-foreground">{valor}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function PerformancePage() {
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [lancamentosMes, projetosPorEtapa, clientesAtivos, leads, lancamentosPendentes, config, tarefas] =
    await Promise.all([
      prisma.lancamento.findMany({ where: { vencimento: { gte: inicioMes, lt: fimMes }, status: "PAGO" } }),
      prisma.projeto.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.clienteRecorrente.count({ where: { status: "ATIVO" } }),
      prisma.lead.findMany(),
      prisma.lancamento.count({ where: { status: "PENDENTE", vencimento: { lt: now } } }),
      getConfiguracao(),
      prisma.tarefa.findMany(),
    ]);

  const receita = lancamentosMes.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0);
  const despesa = lancamentosMes.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0);
  const lucro = receita - despesa;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;

  const leadsFechados = leads.filter((l) => l.etapa === "FECHADO");
  const leadsEmAberto = leads.filter((l) => l.etapa !== "FECHADO" && l.etapa !== "PERDIDO").length;
  const conversao = leads.length > 0 ? (leadsFechados.length / leads.length) * 100 : 0;
  const ticketMedio =
    leadsFechados.length > 0
      ? leadsFechados.reduce((s, l) => s + Number(l.valorEstimado ?? 0), 0) / leadsFechados.length
      : 0;
  const pipelineValor = leads
    .filter((l) => l.etapa !== "FECHADO" && l.etapa !== "PERDIDO")
    .reduce((s, l) => s + Number(l.valorEstimado ?? 0), 0);

  const projetosAtivos = projetosPorEtapa
    .filter((p) => p.status !== "CONCLUIDA")
    .reduce((s, p) => s + p._count._all, 0);

  const metaMensal = config.metaMensal ? Number(config.metaMensal) : null;

  const saudeFinanceira = Math.max(0, Math.min(100, margem));
  const saudeOperacional = lancamentosPendentes === 0 ? 100 : Math.max(0, 100 - lancamentosPendentes * 10);
  const saudeComercial = Math.max(0, Math.min(100, conversao));
  const saudeMeta = metaMensal ? Math.max(0, Math.min(100, (receita / metaMensal) * 100)) : 0;
  const saudeGeral = Math.round((saudeFinanceira + saudeOperacional + saudeComercial + saudeMeta) / 4);

  const funil = ETAPAS.map((et) => ({ ...et, total: leads.filter((l) => l.etapa === et.value).length }));
  const maxFunil = Math.max(1, ...funil.map((f) => f.total));

  const producao = ETAPAS_PRODUCAO.map((et) => ({
    ...et,
    total: projetosPorEtapa.find((p) => p.status === et.value)?._count._all ?? 0,
  }));
  const maxProducao = Math.max(1, ...producao.map((p) => p.total));

  const despesasPorCategoria = lancamentosMes
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const k = l.categoria ?? "Sem categoria";
      acc[k] = (acc[k] ?? 0) + Number(l.valor);
      return acc;
    }, {});
  const totalDespesas = Object.values(despesasPorCategoria).reduce((s, v) => s + v, 0);
  const categorias = Object.entries(despesasPorCategoria).sort((a, b) => b[1] - a[1]);

  const tarefasAbertas = tarefas.filter((t) => !t.concluida).length;
  const tarefasAtrasadas = tarefas.filter((t) => !t.concluida && t.prazo && t.prazo < now).length;

  const visaoGeral = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card flex items-center gap-6 lg:col-span-1">
        <HealthGauge value={saudeGeral} />
        <div>
          <div className="text-xs font-medium tracking-wide text-muted uppercase">Saúde da empresa</div>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <span className="text-muted">Financeira <span className="text-foreground">{Math.round(saudeFinanceira)}</span></span>
            <span className="text-muted">Operacional <span className="text-foreground">{Math.round(saudeOperacional)}</span></span>
            <span className="text-muted">Comercial <span className="text-foreground">{Math.round(saudeComercial)}</span></span>
            <span className="text-muted">Meta <span className="text-foreground">{Math.round(saudeMeta)}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
        <StatCard label="Receita do mês" value={<Money value={receita} />} icon={Wallet} />
        <StatCard label="Lucro" value={<Money value={lucro} />} hint={`${margem.toFixed(1)}% margem`} icon={TrendingUp} tone={lucro >= 0 ? "success" : "danger"} />
        <StatCard label="Projetos ativos" value={projetosAtivos} icon={FolderKanban} />
        <StatCard label="Clientes ativos" value={clientesAtivos} icon={Users} />
        <StatCard label="Conversão comercial" value={`${conversao.toFixed(1)}%`} hint={<>Ticket <Money value={ticketMedio} /></>} icon={Target} />
        <StatCard label="Leads em aberto" value={leadsEmAberto} icon={UserCheck} />
      </div>
    </div>
  );

  const comercial = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-muted uppercase">Funil de leads</h2>
        <div className="flex flex-col gap-3">
          {funil.map((et) => (
            <Barra key={et.value} label={<span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${et.dot}`} />{et.label}</span>} valor={et.total} max={maxFunil} cor="bg-accent" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Conversão" value={`${conversao.toFixed(1)}%`} icon={Target} />
          <StatCard label="Ticket médio" value={<Money value={ticketMedio} />} icon={Wallet} />
          <StatCard label="Pipeline aberto" value={<Money value={pipelineValor} />} icon={TrendingUp} tone="success" />
          <StatCard label="Leads fechados" value={leadsFechados.length} icon={UserCheck} />
        </div>
      </div>
    </div>
  );

  const financeiro = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Receita" value={<Money value={receita} />} icon={Wallet} tone="success" />
          <StatCard label="Despesa" value={<Money value={despesa} />} icon={Wallet} tone="danger" />
          <StatCard label="Lucro" value={<Money value={lucro} />} tone={lucro >= 0 ? "success" : "danger"} icon={TrendingUp} />
          <StatCard label="Margem" value={`${margem.toFixed(1)}%`} icon={Target} />
        </div>
      </div>
      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-muted uppercase">Onde sai o dinheiro</h2>
        {categorias.length === 0 ? (
          <p className="text-sm text-muted">Sem despesas no mês.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {categorias.map(([cat, valor]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{cat}</span>
                  <span className="text-muted"><Money value={valor} /></span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const producaoTab = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-muted uppercase">Produções por etapa</h2>
        <div className="flex flex-col gap-3">
          {producao.map((et) => (
            <Barra key={et.value} label={<span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${et.dot}`} />{et.label}</span>} valor={et.total} max={maxProducao} cor="bg-accent" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Projetos ativos" value={projetosAtivos} icon={FolderKanban} />
        <StatCard label="Tarefas abertas" value={tarefasAbertas} icon={UserCheck} />
        <StatCard label="Tarefas atrasadas" value={tarefasAtrasadas} icon={Target} tone={tarefasAtrasadas > 0 ? "danger" : "default"} />
        <StatCard label="Clientes ativos" value={clientesAtivos} icon={Users} />
      </div>
    </div>
  );

  const abas = [
    { id: "visao", label: "Visão Geral", content: visaoGeral },
    { id: "comercial", label: "Comercial", content: comercial },
    { id: "financeiro", label: "Financeiro", content: financeiro },
    { id: "producao", label: "Produção", content: producaoTab },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Performance"
        title="Centro Estratégico"
        subtitle="Estou crescendo? Estou lucrando? Minha operação está saudável?"
      />
      <LeadTabs abas={abas} />
    </div>
  );
}
