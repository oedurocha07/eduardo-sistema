"use client";

import { Printer } from "lucide-react";
import { AvraLogo } from "@/app/components/AvraLogo";

type Item = { id: string; titulo: string; detalhe: string | null };
type Etapa = { id: string; titulo: string; prazo: string | null };

export function ResultadoPreview({
  titulo,
  clienteNome,
  nomeProdutora,
  logoUrl,
  conteudo,
  itensEscopo,
  etapas,
  valor,
  recorrente,
  parcelamento,
  condicoesPagamento,
  validade,
  numero,
}: {
  titulo: string;
  clienteNome: string | null;
  nomeProdutora: string;
  logoUrl: string | null;
  conteudo: string | null;
  itensEscopo: Item[];
  etapas: Etapa[];
  valor: number | null;
  recorrente: boolean;
  parcelamento: number | null;
  condicoesPagamento: string | null;
  validade: Date | null;
  numero: string;
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} />
          Baixar proposta (PDF)
        </button>
      </div>

      <div className="card mx-auto max-w-3xl gap-8 p-10 print:border-none print:p-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={nomeProdutora} className="h-8 w-8 object-contain" />
            ) : (
              <AvraLogo className="h-8 w-8 text-accent" />
            )}
            <div>
              <div className="text-xs tracking-wide text-muted uppercase">Proposta comercial</div>
              <div className="text-sm font-semibold text-foreground">{nomeProdutora}</div>
            </div>
          </div>
          <div className="text-right text-xs text-muted">
            <div>{numero}</div>
            {validade && <div>Válida até {validade.toLocaleDateString("pt-BR")}</div>}
          </div>
        </div>

        <div>
          <div className="text-xs tracking-wide text-accent uppercase">Preparada para</div>
          <h1 className="mt-1 text-3xl font-bold text-foreground">{titulo}</h1>
          {clienteNome && <p className="mt-1 text-muted">{clienteNome}</p>}
        </div>

        {conteudo && (
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Conceito</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{conteudo}</p>
          </div>
        )}

        {itensEscopo.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Escopo</h2>
            <ul className="flex flex-col gap-2">
              {itensEscopo.map((item) => (
                <li key={item.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">{item.titulo}</span>
                  {item.detalhe && <span className="text-muted"> — {item.detalhe}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {etapas.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Cronograma</h2>
            <ul className="flex flex-col gap-2">
              {etapas.map((etapa) => (
                <li key={etapa.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-foreground">{etapa.titulo}</span>
                  {etapa.prazo && <span className="text-muted">{etapa.prazo}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {valor != null && (
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-6">
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Investimento</h2>
            <div className="text-3xl font-bold text-foreground">
              R$ {valor.toLocaleString("pt-BR")}
              {recorrente && <span className="text-base font-normal text-muted"> /mês</span>}
            </div>
            {parcelamento && parcelamento > 1 && (
              <p className="mt-1 text-sm text-muted">
                Em até {parcelamento}x de R$ {(valor / parcelamento).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
            )}
            {condicoesPagamento && <p className="mt-2 text-sm whitespace-pre-line text-muted">{condicoesPagamento}</p>}
          </div>
        )}

        <div className="border-t border-border pt-4 text-center text-xs text-muted">
          Proposta preparada pela {nomeProdutora}.
        </div>
      </div>
    </div>
  );
}
