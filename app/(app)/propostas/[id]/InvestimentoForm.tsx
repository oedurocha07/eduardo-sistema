"use client";

import { useMemo, useState, useTransition } from "react";
import { updatePropostaInvestimento } from "../actions";
import { PropostaCorPicker } from "./PropostaCorPicker";

type Item = { id: string; titulo: string; custoInterno: number | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const FATURAMENTO_60_40 =
  "O faturamento será realizado em 60% referente à prestação de serviços e 40% referente à locação dos equipamentos utilizados na execução do projeto, conforme Nota Fiscal emitida pela AVRA.";

const CONDICOES_PAGAMENTO_PRESET = [
  {
    label: "50% aprovação + 50% entrega",
    texto: `50% na aprovação da proposta e 50% na entrega final dos materiais.\n${FATURAMENTO_60_40}`,
  },
  {
    label: "À vista, na aprovação",
    texto: `Pagamento à vista, mediante aprovação da proposta.\n${FATURAMENTO_60_40}`,
  },
  {
    label: "Data combinada entre as partes",
    texto: `Pagamento com data combinada entre ambas partes.\n${FATURAMENTO_60_40}`,
  },
];

export function InvestimentoForm({
  propostaId,
  valor,
  validade,
  recorrente,
  parcelamento,
  condicoesPagamento,
  itensEscopo,
  margemDesejada,
  corDestaque,
}: {
  propostaId: string;
  valor: number | null;
  validade: Date | null;
  recorrente: boolean;
  parcelamento: number | null;
  condicoesPagamento: string | null;
  itensEscopo: Item[];
  margemDesejada: number | null;
  corDestaque: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [ehRecorrente, setEhRecorrente] = useState(recorrente);
  const [margem, setMargem] = useState(margemDesejada ?? 0);
  const [valorAtual, setValorAtual] = useState(valor != null ? String(valor) : "");
  const [condicoes, setCondicoes] = useState(condicoesPagamento ?? "");
  const validadeISO = validade ? validade.toISOString().slice(0, 10) : "";

  const itensComCusto = useMemo(() => itensEscopo.filter((i) => i.custoInterno != null && i.custoInterno > 0), [itensEscopo]);

  const custoOperacional = useMemo(
    () => itensEscopo.reduce((soma, item) => soma + (item.custoInterno ?? 0), 0),
    [itensEscopo],
  );

  const precoSugerido = useMemo(() => {
    if (custoOperacional <= 0) return 0;
    if (margem >= 100) return custoOperacional;
    return custoOperacional / (1 - margem / 100);
  }, [custoOperacional, margem]);

  const lucroEstimado = precoSugerido - custoOperacional;

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">Formação do preço</h2>

        {custoOperacional <= 0 && (
          <p className="text-xs text-muted">
            Preencha o custo interno dos itens na aba Escopo pra ver o preço sugerido calculado aqui.
          </p>
        )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted">Custo operacional</div>
              <div className="text-lg font-semibold text-foreground">{brl(custoOperacional)}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted">Margem desejada</div>
              <div className="text-lg font-semibold text-foreground">{margem}%</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted">Preço sugerido</div>
              <div className="text-lg font-semibold text-foreground">{brl(precoSugerido)}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted">Lucro estimado</div>
              <div className="text-lg font-semibold text-success">{brl(lucroEstimado)}</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Quanto você quer de margem?</span>
              <span className="font-medium text-foreground">{margem}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={1}
              value={margem}
              onChange={(e) => setMargem(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="text-xs text-muted">O preço é recalculado em tempo real para proteger sua margem.</p>
          </div>

          {itensComCusto.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="uppercase tracking-wide">Custos do escopo</span>
                <span>{itensComCusto.length} item(ns)</span>
              </div>
              {itensComCusto.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.titulo}</span>
                  <span className="text-muted">{brl(item.custoInterno ?? 0)}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setValorAtual(precoSugerido.toFixed(2))}
            className="btn-primary self-start text-xs"
          >
            Usar {brl(precoSugerido)} como investimento
          </button>
      </div>

      <PropostaCorPicker propostaId={propostaId} corAtual={corDestaque} />

      <form
        action={(formData) => {
          formData.set("margemDesejada", String(margem));
          startTransition(() => updatePropostaInvestimento(propostaId, formData));
        }}
        className="card flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Valor {ehRecorrente ? "mensal" : "total"} (R$)</label>
            <input
              name="valor"
              type="number"
              step="0.01"
              value={valorAtual}
              onChange={(e) => setValorAtual(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Proposta válida até</label>
            <input name="validade" type="date" defaultValue={validadeISO} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Parcelamento (em até Nx)</label>
            <input name="parcelamento" type="number" min={1} defaultValue={parcelamento ?? ""} className="input" />
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-muted">
            <input
              name="recorrente"
              type="checkbox"
              checked={ehRecorrente}
              onChange={(e) => setEhRecorrente(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            É um serviço recorrente (mensal)
          </label>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-muted">Condições de pagamento</label>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) setCondicoes(CONDICOES_PAGAMENTO_PRESET[Number(e.target.value)].texto);
              }}
              className="input"
            >
              <option value="">Escolher um modelo pronto...</option>
              {CONDICOES_PAGAMENTO_PRESET.map((c, i) => (
                <option key={i} value={i}>
                  {c.label}
                </option>
              ))}
            </select>
            <textarea
              name="condicoesPagamento"
              value={condicoes}
              onChange={(e) => setCondicoes(e.target.value)}
              placeholder="Ex: 50% na aprovação, 50% na entrega"
              rows={4}
              className="input"
            />
          </div>
        </div>
        <button type="submit" disabled={isPending} className="btn-primary self-start">
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
