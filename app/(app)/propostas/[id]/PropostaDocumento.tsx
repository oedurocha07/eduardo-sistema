import { AvraLogo } from "@/app/components/AvraLogo";
import { BRAND_COLORS, isBrandColorKey } from "@/app/lib/brandColors";

type Item = { id: string; titulo: string; detalhe: string | null };
type Etapa = { id: string; titulo: string; prazo: string | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: Date) => d.toLocaleDateString("pt-BR");

export function PropostaDocumento({
  titulo,
  clienteNome,
  nomeProdutora,
  logoUrl,
  fraseAbertura,
  contextoProjeto,
  itensEscopo,
  etapas,
  semCronograma,
  valor,
  recorrente,
  parcelamento,
  condicoesPagamento,
  validade,
  numero,
  corDestaque,
}: {
  titulo: string;
  clienteNome: string | null;
  nomeProdutora: string;
  logoUrl: string | null;
  fraseAbertura: string | null;
  contextoProjeto: string | null;
  itensEscopo: Item[];
  etapas: Etapa[];
  semCronograma: boolean;
  valor: number | null;
  recorrente: boolean;
  parcelamento: number | null;
  condicoesPagamento: string | null;
  validade: Date | null;
  numero: string;
  corDestaque: string | null;
}) {
  const mostrarCronograma = !semCronograma && etapas.length > 0;
  const secoes = [Boolean(fraseAbertura || contextoProjeto), itensEscopo.length > 0 || valor != null, mostrarCronograma];
  const numerosSecao = secoes.reduce<string[]>((acc, ativa) => {
    acc.push(ativa ? String(acc.filter(Boolean).length + 1).padStart(2, "0") : "");
    return acc;
  }, []);

  const accentStyle =
    corDestaque && isBrandColorKey(corDestaque)
      ? ({ "--pp-accent": BRAND_COLORS[corDestaque].accent } as React.CSSProperties)
      : undefined;

  return (
    <div className="pp-shell" style={accentStyle}>
      <header className="pp-topo">
        <div className="pp-brand">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nomeProdutora} className="h-8 w-8 object-contain" />
          ) : (
            <AvraLogo className="h-6 w-6" fill="currentColor" />
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
          </div>
          <div className="pp-client-footer">
            Esta proposta foi preparada exclusivamente para você.
            {validade && ` Válida até ${dataBR(validade)}.`}
          </div>
        </aside>
      </section>

      {(fraseAbertura || contextoProjeto) && (
        <section className="pp-bloco">
          <div className="pp-section-head">
            <span className="pp-section-num">{numerosSecao[0]}</span>
            <div>
              <h2 className="pp-heading pp-section-title">O ponto de partida</h2>
              <p className="pp-section-desc">Contexto da oportunidade e objetivo do projeto.</p>
            </div>
          </div>
          {fraseAbertura && <p className="pp-contexto pp-contexto-abertura">{fraseAbertura}</p>}
          {contextoProjeto && <p className="pp-contexto">{contextoProjeto}</p>}
        </section>
      )}

      {(itensEscopo.length > 0 || valor != null) && (
        <section className="pp-bloco">
          <div className="pp-section-head">
            <span className="pp-section-num">{numerosSecao[1]}</span>
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

      {mostrarCronograma && (
        <section className="pp-bloco">
          <div className="pp-section-head">
            <span className="pp-section-num">{numerosSecao[2]}</span>
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
  );
}
