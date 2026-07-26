"use client";

import { useState } from "react";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { useMoneyVisibility } from "@/app/components/MoneyVisibilityContext";

type Ponto = { mes: string; receita: number; despesa: number };
type TipoGrafico = "barra" | "linha";

function formatMoneyShort(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function pontoX(i: number, groupWidth: number, padding: number) {
  return padding / 2 + i * groupWidth + groupWidth / 2;
}

function caminhoSuave(pontos: { x: number; y: number }[]) {
  if (pontos.length === 0) return "";
  if (pontos.length === 1) return `M ${pontos[0].x} ${pontos[0].y}`;
  let d = `M ${pontos[0].x} ${pontos[0].y}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i];
    const p1 = pontos[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function ReceitaDespesaChart({ dados }: { dados: Ponto[] }) {
  const { hidden } = useMoneyVisibility();
  const [hover, setHover] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoGrafico>("barra");

  const max = Math.max(1, ...dados.map((d) => Math.max(d.receita, d.despesa)));
  const width = 560;
  const height = 200;
  const padding = 28;
  const groupWidth = (width - padding) / dados.length;
  const barWidth = Math.min(20, groupWidth / 3.2);

  const pontosReceita = dados.map((d, i) => ({
    x: pontoX(i, groupWidth, padding),
    y: height - (d.receita / max) * (height - 12),
  }));
  const pontosDespesa = dados.map((d, i) => ({
    x: pontoX(i, groupWidth, padding),
    y: height - (d.despesa / max) * (height - 12),
  }));

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" /> Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Despesa
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setTipo("barra")}
            className={`rounded-md p-1 transition-colors ${tipo === "barra" ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"}`}
            title="Gráfico de barras"
          >
            <BarChart3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setTipo("linha")}
            className={`rounded-md p-1 transition-colors ${tipo === "linha" ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"}`}
            title="Gráfico de linha"
          >
            <LineChartIcon size={14} />
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height + 24}`}
        className="w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <line x1={0} y1={height} x2={width} y2={height} stroke="var(--border)" strokeWidth={1} />

        {tipo === "linha" && (
          <>
            <path d={caminhoSuave(pontosReceita)} fill="none" stroke="var(--success)" strokeWidth={2} />
            <path d={caminhoSuave(pontosDespesa)} fill="none" stroke="var(--danger)" strokeWidth={2} />
            {pontosReceita.map((p, i) => (
              <circle
                key={`r${i}`}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 4.5 : 3}
                fill="var(--success)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            ))}
            {pontosDespesa.map((p, i) => (
              <circle
                key={`d${i}`}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 4.5 : 3}
                fill="var(--danger)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            ))}
          </>
        )}

        {dados.map((d, i) => {
          const cx = pontoX(i, groupWidth, padding);
          const hReceita = (d.receita / max) * (height - 12);
          const hDespesa = (d.despesa / max) * (height - 12);
          const isHover = hover === i;

          return (
            <g key={d.mes} onMouseEnter={() => setHover(i)} className="cursor-pointer">
              <rect x={cx - groupWidth / 2} y={0} width={groupWidth} height={height} fill="transparent" />

              {tipo === "barra" && (
                <>
                  <rect
                    x={cx - barWidth - 2}
                    y={height - hReceita}
                    width={barWidth}
                    height={Math.max(hReceita, 2)}
                    rx={4}
                    fill="var(--success)"
                    opacity={isHover || hover === null ? 1 : 0.45}
                  />
                  <rect
                    x={cx + 2}
                    y={height - hDespesa}
                    width={barWidth}
                    height={Math.max(hDespesa, 2)}
                    rx={4}
                    fill="var(--danger)"
                    opacity={isHover || hover === null ? 1 : 0.45}
                  />
                </>
              )}

              {isHover && (
                <line x1={cx} y1={0} x2={cx} y2={height} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
              )}

              <text x={cx} y={height + 16} textAnchor="middle" fontSize={11} fill="var(--muted)" className="capitalize">
                {d.mes}
              </text>
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div className="pointer-events-none absolute top-0 right-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
          <div className="mb-1 font-medium text-foreground capitalize">{dados[hover].mes}</div>
          <div className="flex items-center gap-2 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {hidden ? "••••" : formatMoneyShort(dados[hover].receita)}
          </div>
          <div className="flex items-center gap-2 text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            {hidden ? "••••" : formatMoneyShort(dados[hover].despesa)}
          </div>
        </div>
      )}
    </div>
  );
}
