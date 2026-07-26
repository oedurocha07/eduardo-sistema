import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewLancamentoForm } from "./NewLancamentoForm";
import { MarcarPagoButton } from "./MarcarPagoButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { Receipt, X } from "lucide-react";
import { TipoLancamento, StatusLancamento, Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = { tipo?: string; status?: string; mes?: string };

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, status, mes } = await searchParams;

  const where: Prisma.LancamentoWhereInput = {};
  if (tipo === "RECEITA" || tipo === "DESPESA") where.tipo = tipo as TipoLancamento;
  if (status === "PAGO" || status === "PENDENTE") where.status = status as StatusLancamento;
  if (mes) {
    const [ano, mesNum] = mes.split("-").map(Number);
    const inicio = new Date(ano, mesNum - 1, 1);
    const fim = new Date(ano, mesNum, 1);
    where.vencimento = { gte: inicio, lt: fim };
  }

  const lancamentos = await prisma.lancamento.findMany({
    where,
    include: { cliente: { include: { empresa: true } }, projeto: true },
    orderBy: { vencimento: "desc" },
  });

  const filtrosAtivos = Boolean(tipo || status || mes);

  const LABELS: Record<string, string> = {
    RECEITA: "Receita",
    DESPESA: "Despesa",
    PAGO: "Pago",
    PENDENTE: "Pendente",
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Lançamentos" />
      <NewLancamentoForm />

      {filtrosAtivos && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Filtrando por:</span>
          {tipo && <Badge tone="neutral">{LABELS[tipo] ?? tipo}</Badge>}
          {status && <Badge tone="neutral">{LABELS[status] ?? status}</Badge>}
          {mes && <Badge tone="neutral">{mes}</Badge>}
          <Link href="/financeiro/lancamentos" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
            <X size={12} /> limpar
          </Link>
        </div>
      )}

      {lancamentos.length === 0 ? (
        <EmptyState icon={Receipt} title="Nenhum lançamento encontrado" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Cliente/Projeto</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{l.descricao}</td>
                  <td className="px-4 py-3 text-muted">{l.categoria ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{l.projeto?.nome ?? l.cliente?.empresa.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{l.vencimento.toLocaleDateString("pt-BR")}</td>
                  <td className={`px-4 py-3 font-medium ${l.tipo === "RECEITA" ? "text-success" : "text-danger"}`}>
                    <Money value={Number(l.valor)} sign={l.tipo === "RECEITA" ? "+" : "-"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={l.status === "PAGO" ? "success" : "warning"}>
                      {l.status === "PAGO" ? "Pago" : "Pendente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{l.status === "PENDENTE" && <MarcarPagoButton id={l.id} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
