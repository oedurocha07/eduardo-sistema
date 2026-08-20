"use client";

import { useState } from "react";
import { Target, X } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { Badge } from "@/app/components/ui/Badge";
import { updatePropostaPagoManual } from "./actions";

type LancamentoItem = { id: string; descricao: string; valor: number; status: string; vencimento: string };
type RecorrenteItem = { id: string; nome: string; valorMensal: number };
type PropostaItem = { id: string; titulo: string; cliente: string; valor: number; pagoManual: boolean };

export function ProjecaoDoMesButton({
  projecaoMes,
  lancamentos,
  recorrentes,
  propostas,
}: {
  projecaoMes: number;
  lancamentos: LancamentoItem[];
  recorrentes: RecorrenteItem[];
  propostas: PropostaItem[];
}) {
  const [open, setOpen] = useState(false);
  const [propostasState, setPropostasState] = useState(propostas);

  const totalLancado = lancamentos.reduce((s, l) => s + l.valor, 0);
  const totalPago = lancamentos.filter((l) => l.status === "PAGO").reduce((s, l) => s + l.valor, 0);
  const totalPendente = lancamentos.filter((l) => l.status === "PENDENTE").reduce((s, l) => s + l.valor, 0);
  const totalRecorrentes = recorrentes.reduce((s, r) => s + r.valorMensal, 0);
  const totalPropostas = propostasState.reduce((s, p) => s + p.valor, 0);

  function handlePagoChange(propostaId: string, pago: boolean) {
    setPropostasState((prev) => prev.map((p) => (p.id === propostaId ? { ...p, pagoManual: pago } : p)));
    updatePropostaPagoManual(propostaId, pago).catch(() => {
      setPropostasState((prev) => prev.map((p) => (p.id === propostaId ? { ...p, pagoManual: !pago } : p)));
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="card w-full text-left transition-colors hover:border-accent/30">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">Projeção do mês</span>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
            <Target size={15} />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">
          <Money value={projecaoMes} />
        </div>
        <div className="mt-1 text-xs text-muted">
          Estimativa: propostas aprovadas + recorrentes ativos. Clique para ver o detalhamento.
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Projeção do mês</h2>
                <p className="text-xs text-muted">O que já foi lançado, o que é recorrência e o que é proposta aprovada.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Já lançado */}
              <section className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Já lançado em Financeiro (este mês)</h3>
                  <Money value={totalLancado} className="text-sm font-semibold text-foreground" />
                </div>
                {lancamentos.length === 0 ? (
                  <p className="text-sm text-muted">Nenhum lançamento de receita neste mês ainda.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {lancamentos.map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate text-foreground">{l.descricao}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone={l.status === "PAGO" ? "success" : "neutral"}>{l.status === "PAGO" ? "Pago" : "Pendente"}</Badge>
                          <Money value={l.valor} className="text-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-4 text-xs text-muted">
                  <span>Pago: <Money value={totalPago} /></span>
                  <span>Pendente: <Money value={totalPendente} /></span>
                </div>
              </section>

              {/* Recorrentes ativos */}
              <section className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Recorrências ativas</h3>
                  <Money value={totalRecorrentes} className="text-sm font-semibold text-foreground" />
                </div>
                {recorrentes.length === 0 ? (
                  <p className="text-sm text-muted">Nenhum cliente recorrente ativo.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {recorrentes.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate text-foreground">{r.nome}</span>
                        <Money value={r.valorMensal} className="shrink-0 text-muted" />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Propostas aprovadas */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Propostas aprovadas</h3>
                  <Money value={totalPropostas} className="text-sm font-semibold text-foreground" />
                </div>
                <p className="mb-2 text-xs text-muted">
                  O status abaixo é só um controle visual seu — quando o pagamento realmente cair, ele já vai estar em Financeiro.
                </p>
                {propostasState.length === 0 ? (
                  <p className="text-sm text-muted">Nenhuma proposta aprovada aguardando faturamento.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {propostasState.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-foreground">{p.titulo}</div>
                          {p.cliente && <div className="truncate text-xs text-muted">{p.cliente}</div>}
                        </div>
                        <Money value={p.valor} className="shrink-0 text-muted" />
                        <select
                          value={p.pagoManual ? "pago" : "nao_pago"}
                          onChange={(e) => handlePagoChange(p.id, e.target.value === "pago")}
                          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${
                            p.pagoManual
                              ? "border-success/30 bg-success/15 text-success"
                              : "border-border bg-surface-hover text-muted"
                          }`}
                        >
                          <option value="nao_pago">Não pago</option>
                          <option value="pago">Pago</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-hover px-5 py-3">
              <span className="text-xs text-muted">Recorrentes + propostas aprovadas</span>
              <Money value={projecaoMes} className="text-base font-bold text-foreground" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
