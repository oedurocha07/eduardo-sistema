import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { Money } from "@/app/components/ui/Money";
import { proximoRef } from "@/app/(app)/agenda/dateUtils";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Percent, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const now = new Date();

  let ref = now;
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [ano, mesNum] = mes.split("-").map(Number);
    ref = new Date(ano, mesNum - 1, 1);
  }

  const inicioMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const fimMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  const mesParam = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;

  const mesAnteriorParam = (() => {
    const anterior = proximoRef("mes", ref, -1);
    return `${anterior.getFullYear()}-${String(anterior.getMonth() + 1).padStart(2, "0")}`;
  })();
  const mesSeguinteParam = (() => {
    const seguinte = proximoRef("mes", ref, 1);
    return `${seguinte.getFullYear()}-${String(seguinte.getMonth() + 1).padStart(2, "0")}`;
  })();
  const estaNoMesAtual = ref.getFullYear() === now.getFullYear() && ref.getMonth() === now.getMonth();

  const [lancamentosMes, vencimentosPendentes] = await Promise.all([
    prisma.lancamento.findMany({
      where: { vencimento: { gte: inicioMes, lt: fimMes } },
    }),
    prisma.lancamento.findMany({
      where: { status: "PENDENTE", vencimento: { gte: now } },
      include: { cliente: { include: { empresa: true } } },
      orderBy: { vencimento: "asc" },
      take: 6,
    }),
  ]);

  const recebido = lancamentosMes
    .filter((l) => l.tipo === "RECEITA" && l.status === "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const aReceber = lancamentosMes
    .filter((l) => l.tipo === "RECEITA" && l.status === "PENDENTE")
    .reduce((s, l) => s + Number(l.valor), 0);
  const pago = lancamentosMes
    .filter((l) => l.tipo === "DESPESA" && l.status === "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const aPagar = lancamentosMes
    .filter((l) => l.tipo === "DESPESA" && l.status === "PENDENTE")
    .reduce((s, l) => s + Number(l.valor), 0);

  const saldoRealizado = recebido - pago;
  const margem = recebido > 0 ? (saldoRealizado / recebido) * 100 : 0;

  const despesasPorCategoria = lancamentosMes
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const chave = l.categoria ?? "Sem categoria";
      acc[chave] = (acc[chave] ?? 0) + Number(l.valor);
      return acc;
    }, {});
  const totalDespesas = Object.values(despesasPorCategoria).reduce((s, v) => s + v, 0);
  const categoriasOrdenadas = Object.entries(despesasPorCategoria).sort((a, b) => b[1] - a[1]);

  const mesLabel = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Financeiro"
        title="Controle Financeiro"
        action={
          <div className="flex items-center gap-1">
            <Link href={`/financeiro?mes=${mesAnteriorParam}`} className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground">
              <ChevronLeft size={16} />
            </Link>
            <span className="min-w-32 text-center text-sm font-medium text-foreground capitalize">{mesLabel}</span>
            <Link href={`/financeiro?mes=${mesSeguinteParam}`} className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground">
              <ChevronRight size={16} />
            </Link>
            {!estaNoMesAtual && (
              <Link href="/financeiro" className="ml-2 text-xs text-accent-hover hover:underline">
                Hoje
              </Link>
            )}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link href={`/financeiro/lancamentos?tipo=RECEITA&status=PAGO&mes=${mesParam}`} className="block">
          <StatCard
            label="Recebido"
            value={<Money value={recebido} />}
            hint={<Money value={aReceber} suffix=" a receber" />}
            icon={ArrowUpCircle}
            tone="success"
          />
        </Link>
        <Link href={`/financeiro/lancamentos?tipo=DESPESA&status=PAGO&mes=${mesParam}`} className="block">
          <StatCard
            label="Pago"
            value={<Money value={pago} />}
            hint={<Money value={aPagar} suffix=" a pagar" />}
            icon={ArrowDownCircle}
            tone="danger"
          />
        </Link>
        <Link href={`/financeiro/lancamentos?status=PAGO&mes=${mesParam}`} className="block">
          <StatCard label="Saldo realizado" value={<Money value={saldoRealizado} />} icon={Wallet} />
        </Link>
        <Link href={`/financeiro/lancamentos?mes=${mesParam}`} className="block">
          <StatCard label="Margem realizada" value={`${margem.toFixed(1)}%`} icon={Percent} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-muted uppercase">Onde sai o dinheiro</h2>
          {categoriasOrdenadas.length === 0 ? (
            <p className="text-sm text-muted">Sem despesas em {mesLabel}.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {categoriasOrdenadas.map(([categoria, valor]) => {
                const pct = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;
                return (
                  <div key={categoria}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-foreground">{categoria}</span>
                      <span className="text-muted">
                        <Money value={valor} /> · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
            <CalendarClock size={14} /> Vencimentos pendentes
          </h2>
          {vencimentosPendentes.length === 0 ? (
            <p className="text-sm text-muted">Nada pendente. Caixa em dia.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {vencimentosPendentes.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="truncate text-foreground">{l.descricao}</div>
                    <div className="text-xs text-muted">
                      {l.vencimento.toLocaleDateString("pt-BR")}
                      {l.cliente && <> · {l.cliente.empresa.nome}</>}
                    </div>
                  </div>
                  <Money
                    value={Number(l.valor)}
                    className={l.tipo === "RECEITA" ? "text-success shrink-0" : "text-danger shrink-0"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
