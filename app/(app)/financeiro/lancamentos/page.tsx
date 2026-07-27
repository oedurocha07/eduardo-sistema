import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewLancamentoForm } from "./NewLancamentoForm";
import { EditLancamentoButton } from "./EditLancamentoButton";
import { DeleteLancamentoButton } from "./DeleteLancamentoButton";
import { MarcarPagoButton, DesfazerPagamentoButton } from "./MarcarPagoButton";
import { FiltroLancamentos } from "./FiltroLancamentos";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { Receipt, X, Paperclip } from "lucide-react";
import { TipoLancamento, StatusLancamento, Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = { tipo?: string; status?: string; mes?: string; bucket?: string };

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, status, mes, bucket } = await searchParams;

  const where: Prisma.LancamentoWhereInput = {};
  if (tipo === "RECEITA" || tipo === "DESPESA") where.tipo = tipo as TipoLancamento;
  if (status === "PAGO" || status === "PENDENTE") where.status = status as StatusLancamento;
  if (mes) {
    const [ano, mesNum] = mes.split("-").map(Number);
    const inicio = new Date(ano, mesNum - 1, 1);
    const fim = new Date(ano, mesNum, 1);
    where.vencimento = { gte: inicio, lt: fim };
  }
  if (bucket === "atrasados" || bucket === "hoje" || bucket === "7dias") {
    where.status = "PENDENTE";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (bucket === "atrasados") {
      where.vencimento = { lt: hoje };
    } else if (bucket === "hoje") {
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      where.vencimento = { gte: hoje, lt: amanha };
    } else {
      const em7dias = new Date(hoje);
      em7dias.setDate(em7dias.getDate() + 7);
      where.vencimento = { gte: hoje, lte: em7dias };
    }
  }

  const [lancamentos, clientesRaw, projetosRaw] = await Promise.all([
    prisma.lancamento.findMany({
      where,
      include: { cliente: { include: { empresa: true } }, projeto: true },
      orderBy: { vencimento: "desc" },
    }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true } }),
    prisma.projeto.findMany({ select: { id: true, nome: true, clienteId: true } }),
  ]);

  const clientes = clientesRaw.map((c) => ({ id: c.id, nome: c.empresa.nome }));
  const projetos = projetosRaw;

  const filtrosAtivos = Boolean(tipo || status || mes || bucket);

  const LABELS: Record<string, string> = {
    RECEITA: "Receita",
    DESPESA: "Despesa",
    PAGO: "Pago",
    PENDENTE: "Pendente",
    atrasados: "Atrasados",
    hoje: "Vence hoje",
    "7dias": "Próximos 7 dias",
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Lançamentos" />
      <NewLancamentoForm clientes={clientes} projetos={projetos} />
      <FiltroLancamentos />

      {filtrosAtivos && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Filtrando por:</span>
          {tipo && <Badge tone="neutral">{LABELS[tipo] ?? tipo}</Badge>}
          {status && <Badge tone="neutral">{LABELS[status] ?? status}</Badge>}
          {mes && <Badge tone="neutral">{mes}</Badge>}
          {bucket && <Badge tone="neutral">{LABELS[bucket] ?? bucket}</Badge>}
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
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          l.tipo === "RECEITA" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        <Receipt size={13} />
                      </div>
                      {l.descricao}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{l.categoria ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{l.projeto?.nome ?? l.cliente?.empresa.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{l.vencimento.toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted">
                    <div className="flex items-center gap-1.5">
                      <span>{l.formaPagamento ?? "—"}</span>
                      {l.comprovanteUrl && (
                        <a
                          href={l.comprovanteUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Ver comprovante"
                          className="text-muted hover:text-foreground"
                        >
                          <Paperclip size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-medium ${l.tipo === "RECEITA" ? "text-success" : "text-danger"}`}>
                    <Money value={Number(l.valor)} sign={l.tipo === "RECEITA" ? "+" : "-"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={l.status === "PAGO" ? "success" : "warning"}>
                      {l.status === "PAGO" ? "Pago" : "Pendente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {l.status === "PENDENTE" ? <MarcarPagoButton id={l.id} /> : <DesfazerPagamentoButton id={l.id} />}
                      <EditLancamentoButton
                        clientes={clientes}
                        projetos={projetos}
                        lancamento={{
                          id: l.id,
                          tipo: l.tipo,
                          descricao: l.descricao,
                          categoria: l.categoria,
                          valor: Number(l.valor),
                          vencimento: l.vencimento,
                          clienteId: l.clienteId,
                          projetoId: l.projetoId,
                          formaPagamento: l.formaPagamento,
                          comprovanteUrl: l.comprovanteUrl,
                        }}
                      />
                      <DeleteLancamentoButton id={l.id} descricao={l.descricao} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
