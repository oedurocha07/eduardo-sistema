import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Money } from "@/app/components/ui/Money";

export const dynamic = "force-dynamic";

type LancamentoResumo = { id: string; descricao: string; valor: unknown; vencimento: Date };

function classificar(lancamentos: LancamentoResumo[]) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  const atrasados: LancamentoResumo[] = [];
  const hojeLista: LancamentoResumo[] = [];
  const seteDias: LancamentoResumo[] = [];

  for (const l of lancamentos) {
    const venc = new Date(l.vencimento);
    venc.setHours(0, 0, 0, 0);
    if (venc < hoje) atrasados.push(l);
    else if (venc.getTime() === hoje.getTime()) hojeLista.push(l);
    else if (venc <= em7dias) seteDias.push(l);
  }

  const somar = (lista: LancamentoResumo[]) => lista.reduce((s, l) => s + Number(l.valor), 0);

  return {
    atrasados: { itens: atrasados, total: somar(atrasados) },
    hoje: { itens: hojeLista, total: somar(hojeLista) },
    seteDias: { itens: seteDias, total: somar(seteDias) },
  };
}

function Bucket({
  label,
  tone,
  dados,
  bucketKey,
  tipo,
}: {
  label: string;
  tone: "danger" | "warning" | "foreground";
  dados: { itens: LancamentoResumo[]; total: number };
  bucketKey: string;
  tipo: "RECEITA" | "DESPESA";
}) {
  const toneClass = tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div>
      <Link
        href={`/financeiro/lancamentos?bucket=${bucketKey}&tipo=${tipo}`}
        className="mb-1 flex items-center justify-between hover:underline"
      >
        <span className={toneClass}>
          {label} ({dados.itens.length})
        </span>
        <Money value={dados.total} className={toneClass} />
      </Link>
      {dados.itens.length > 0 && (
        <div className="mt-1 flex flex-col gap-1 border-l border-border pl-3">
          {dados.itens.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/financeiro/lancamentos?bucket=${bucketKey}&tipo=${tipo}`}
              className="flex items-center justify-between text-xs text-muted hover:text-foreground"
            >
              <span className="truncate">{item.descricao}</span>
              <Money value={Number(item.valor)} />
            </Link>
          ))}
          {dados.itens.length > 4 && (
            <Link
              href={`/financeiro/lancamentos?bucket=${bucketKey}&tipo=${tipo}`}
              className="text-xs text-accent-hover hover:underline"
            >
              +{dados.itens.length - 4} outros
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Resumo({
  label,
  total,
  dados,
  tipo,
}: {
  label: string;
  total: number;
  dados: ReturnType<typeof classificar>;
  tipo: "RECEITA" | "DESPESA";
}) {
  return (
    <div className="card">
      <div className="text-xs font-medium tracking-wide text-muted uppercase">{label}</div>
      <div className="mb-4 text-2xl font-bold text-foreground">
        <Money value={total} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Bucket label="Atrasados" tone="danger" dados={dados.atrasados} bucketKey="atrasados" tipo={tipo} />
        <Bucket label="Hoje" tone="warning" dados={dados.hoje} bucketKey="hoje" tipo={tipo} />
        <Bucket label="7 dias" tone="foreground" dados={dados.seteDias} bucketKey="7dias" tipo={tipo} />
      </div>
    </div>
  );
}

export default async function ContasPage() {
  const pendentes = await prisma.lancamento.findMany({ where: { status: "PENDENTE" } });
  const aReceber = pendentes.filter((l) => l.tipo === "RECEITA");
  const aPagar = pendentes.filter((l) => l.tipo === "DESPESA");

  const totalReceber = aReceber.reduce((s, l) => s + Number(l.valor), 0);
  const totalPagar = aPagar.reduce((s, l) => s + Number(l.valor), 0);

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Contas" subtitle="Clique em qualquer valor para ver e editar os lançamentos" />
      <div className="grid gap-4 md:grid-cols-2">
        <Resumo label="Total a receber" total={totalReceber} dados={classificar(aReceber)} tipo="RECEITA" />
        <Resumo label="Total a pagar" total={totalPagar} dados={classificar(aPagar)} tipo="DESPESA" />
      </div>
    </div>
  );
}
