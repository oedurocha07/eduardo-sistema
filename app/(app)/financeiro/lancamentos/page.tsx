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
import { proximoRef } from "@/app/(app)/agenda/dateUtils";
import { Receipt, X, Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import { TipoLancamento, StatusLancamento, Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = { tipo?: string; status?: string; mes?: string; bucket?: string };

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, status, mes, bucket } = await searchParams;
  const now = new Date();

  // Datas literais (Lancamento.vencimento) são gravadas "como digitado", forçadas em UTC
  // (ver parseDataHoraLocal) — independente do fuso do container. Por isso "ref" e toda
  // fronteira de mês/dia precisam ficar ancoradas em UTC (Date.UTC / getUTC*).
  let ref = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [ano, mesNum] = mes.split("-").map(Number);
    ref = new Date(Date.UTC(ano, mesNum - 1, 1));
  }
  const inicioMes = ref;
  const fimMes = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 1));
  const mesAnteriorParam = (() => {
    const anterior = proximoRef("mes", ref, -1);
    return `${anterior.getUTCFullYear()}-${String(anterior.getUTCMonth() + 1).padStart(2, "0")}`;
  })();
  const mesSeguinteParam = (() => {
    const seguinte = proximoRef("mes", ref, 1);
    return `${seguinte.getUTCFullYear()}-${String(seguinte.getUTCMonth() + 1).padStart(2, "0")}`;
  })();
  const estaNoMesAtual = ref.getUTCFullYear() === now.getFullYear() && ref.getUTCMonth() === now.getMonth();
  const mesLabel = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

  const paramsExtras = new URLSearchParams();
  if (tipo) paramsExtras.set("tipo", tipo);
  if (status) paramsExtras.set("status", status);
  const sufixoParams = paramsExtras.toString() ? `&${paramsExtras.toString()}` : "";

  const where: Prisma.LancamentoWhereInput = { vencimento: { gte: inicioMes, lt: fimMes } };
  if (tipo === "RECEITA" || tipo === "DESPESA") where.tipo = tipo as TipoLancamento;
  if (status === "PAGO" || status === "PENDENTE") where.status = status as StatusLancamento;
  if (bucket === "atrasados" || bucket === "hoje" || bucket === "7dias") {
    where.status = "PENDENTE";
    const hoje = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    if (bucket === "atrasados") {
      where.vencimento = { lt: hoje };
    } else if (bucket === "hoje") {
      const amanha = new Date(hoje);
      amanha.setUTCDate(amanha.getUTCDate() + 1);
      where.vencimento = { gte: hoje, lt: amanha };
    } else {
      const em7dias = new Date(hoje);
      em7dias.setUTCDate(em7dias.getUTCDate() + 7);
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

  const filtrosAtivos = Boolean(tipo || status || bucket);

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
      <PageHeader
        title="Lançamentos"
        action={
          <div className="flex items-center gap-1">
            <Link
              href={`/financeiro/lancamentos?mes=${mesAnteriorParam}${sufixoParams}`}
              className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </Link>
            <span className="min-w-32 text-center text-sm font-medium text-foreground capitalize">{mesLabel}</span>
            <Link
              href={`/financeiro/lancamentos?mes=${mesSeguinteParam}${sufixoParams}`}
              className="rounded-md bg-surface p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronRight size={16} />
            </Link>
            {!estaNoMesAtual && (
              <Link href={`/financeiro/lancamentos${sufixoParams ? `?${sufixoParams.slice(1)}` : ""}`} className="ml-2 text-xs text-accent-hover hover:underline">
                Hoje
              </Link>
            )}
          </div>
        }
      />
      <NewLancamentoForm clientes={clientes} projetos={projetos} />
      <FiltroLancamentos />

      {filtrosAtivos && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Filtrando por:</span>
          {tipo && <Badge tone="neutral">{LABELS[tipo] ?? tipo}</Badge>}
          {status && <Badge tone="neutral">{LABELS[status] ?? status}</Badge>}
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
                  <td className="px-4 py-3 text-muted">{l.vencimento.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
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
