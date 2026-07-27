"use client";

import { Printer } from "lucide-react";
import { AvraLogo } from "@/app/components/AvraLogo";

type Item = { id: string; titulo: string; detalhe: string | null };
type Etapa = { id: string; titulo: string; prazo: string | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: Date) => d.toLocaleDateString("pt-BR");

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
  const secoes = [Boolean(conteudo), itensEscopo.length > 0 || valor != null, etapas.length > 0];
  let contador = 0;
  const numeroSecao = (idx: number) => {
    if (!secoes[idx]) return "";
    contador += 1;
    return String(contador).padStart(2, "0");
  };

  return (
    <div className="pp-root">
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=chillax@500,600,700&display=swap"
      />

      <div className="mb-4 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} />
          Baixar proposta (PDF)
        </button>
      </div>

      <div className="pp-shell">
        <header className="pp-topo">
          <div className="pp-brand">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={nomeProdutora} className="h-8 w-8 object-contain" />
            ) : (
              <AvraLogo className="h-6 w-6" />
            )}
            <div>
              <div className="pp-brand-sub">Proposta comercial</div>
              <div className="pp-brand-name">{nomeProdutora}</div>
            </div>
          </div>
          <div className="pp-meta">
            <div>{numero}</div>
            {validade && <div>Válida até {dataBR(validade)}</div>}
          </div>
        </header>

        <section className="pp-capa">
          <div className="pp-hero">
            <span className="pp-eyebrow">Proposta audiovisual</span>
            <h1 className="pp-heading pp-title">{titulo}</h1>
            {clienteNome && <p className="pp-cliente">Preparada para {clienteNome}</p>}

            <div className="pp-stats">
              <div className="pp-stat">
                <span className="pp-stat-val">{itensEscopo.length || "—"}</span>
                <span className="pp-stat-label">Itens no escopo</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-val">{recorrente ? "Recorrente" : "Fechado"}</span>
                <span className="pp-stat-label">Formato</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-val">{validade ? dataBR(validade) : "—"}</span>
                <span className="pp-stat-label">Validade</span>
              </div>
            </div>
          </div>

          <aside className="pp-client-card">
            <div className="pp-client-top">
              <span className="pp-eyebrow" style={{ paddingLeft: 0 }}>
                Preparada para
              </span>
              <span className="pp-numero-pill">{numero}</span>
            </div>
            <div className="pp-client-info">
              <div>
                <span className="pp-field-label">Cliente</span>
                <span className="pp-field-val">{clienteNome ?? "—"}</span>
              </div>
              <div>
                <span className="pp-field-label">Investimento</span>
                <span className="pp-field-val">
                  {valor != null ? `${brl(valor)}${recorrente ? "/mês" : ""}` : "A combinar"}
                </span>
              </div>
            </div>
            <div className="pp-client-footer">
              Esta proposta foi preparada exclusivamente para você.
              {validade && ` Válida até ${dataBR(validade)}.`}
            </div>
          </aside>
        </section>

        {conteudo && (
          <section className="pp-bloco">
            <div className="pp-section-head">
              <span className="pp-section-num">{numeroSecao(0)}</span>
              <div>
                <h2 className="pp-heading pp-section-title">O ponto de partida</h2>
                <p className="pp-section-desc">Contexto da oportunidade e objetivo do projeto.</p>
              </div>
            </div>
            <p className="pp-contexto">{conteudo}</p>
          </section>
        )}

        {(itensEscopo.length > 0 || valor != null) && (
          <section className="pp-bloco">
            <div className="pp-section-head">
              <span className="pp-section-num">{numeroSecao(1)}</span>
              <div>
                <h2 className="pp-heading pp-section-title">Escopo e investimento</h2>
                <p className="pp-section-desc">Itens contratados e composição do valor.</p>
              </div>
            </div>

            {itensEscopo.length > 0 && (
              <ul className="pp-itens">
                {itensEscopo.map((item) => (
                  <li key={item.id} className="pp-item">
                    <span className="desc">{item.titulo}</span>
                    {item.detalhe && <span className="detalhe">{item.detalhe}</span>}
                  </li>
                ))}
              </ul>
            )}

            {valor != null && (
              <div className="pp-investimento">
                <span className="label">{recorrente ? "Valor mensal" : "Investimento total"}</span>
                <div className="num-total">
                  {brl(valor)}
                  {recorrente && <span className="por-mes"> /mês</span>}
                </div>
                {parcelamento && parcelamento > 1 && (
                  <p className="parc">
                    Em até {parcelamento}x de {brl(valor / parcelamento)} (sem juros)
                  </p>
                )}
                {condicoesPagamento && <p className="cond">{condicoesPagamento}</p>}
              </div>
            )}
          </section>
        )}

        {etapas.length > 0 && (
          <section className="pp-bloco">
            <div className="pp-section-head">
              <span className="pp-section-num">{numeroSecao(2)}</span>
              <div>
                <h2 className="pp-heading pp-section-title">Cronograma</h2>
                <p className="pp-section-desc">Sequência prevista para alinhamento, produção e entrega.</p>
              </div>
            </div>
            <ul className="pp-timeline">
              {etapas.map((etapa) => (
                <li key={etapa.id} className="pp-etapa">
                  <span className="prazo">{etapa.prazo ?? ""}</span>
                  <span className="nome">{etapa.titulo}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pp-rodape">
          {validade ? (
            <span className="validade">
              Proposta válida até {dataBR(validade)}. Depois desse prazo, valores e agenda podem ser revisados.
            </span>
          ) : (
            <span />
          )}
          <span className="assinatura">{nomeProdutora}</span>
        </footer>
      </div>
    </div>
  );
}
