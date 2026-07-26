import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Money } from "@/app/components/ui/Money";

export const dynamic = "force-dynamic";

function classificar(lancamentos: { vencimento: Date; valor: unknown }[]) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);

  let atrasados = { count: 0, total: 0 };
  let hojeCount = { count: 0, total: 0 };
  let seteDias = { count: 0, total: 0 };

  for (const l of lancamentos) {
    const v = Number(l.valor);
    const venc = new Date(l.vencimento);
    venc.setHours(0, 0, 0, 0);
    if (venc < hoje) {
      atrasados.count++;
      atrasados.total += v;
    } else if (venc.getTime() === hoje.getTime()) {
      hojeCount.count++;
      hojeCount.total += v;
    } else if (venc <= em7dias) {
      seteDias.count++;
      seteDias.total += v;
    }
  }

  return { atrasados, hojeCount, seteDias };
}

function Resumo({ label, total, dados }: { label: string; total: number; dados: ReturnType<typeof classificar> }) {
  return (
    <div className="card">
      <div className="text-xs font-medium tracking-wide text-muted uppercase">{label}</div>
      <div className="mb-4 text-2xl font-bold text-foreground">
        <Money value={total} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-danger">Atrasados</div>
          <div className="text-muted">
            ({dados.atrasados.count}) <Money value={dados.atrasados.total} />
          </div>
        </div>
        <div>
          <div className="text-warning">Hoje</div>
          <div className="text-muted">
            ({dados.hojeCount.count}) <Money value={dados.hojeCount.total} />
          </div>
        </div>
        <div>
          <div className="text-foreground">7 dias</div>
          <div className="text-muted">
            ({dados.seteDias.count}) <Money value={dados.seteDias.total} />
          </div>
        </div>
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
      <PageHeader title="Contas" />
      <div className="grid gap-4 md:grid-cols-2">
        <Resumo label="Total a receber" total={totalReceber} dados={classificar(aReceber)} />
        <Resumo label="Total a pagar" total={totalPagar} dados={classificar(aPagar)} />
      </div>
    </div>
  );
}
