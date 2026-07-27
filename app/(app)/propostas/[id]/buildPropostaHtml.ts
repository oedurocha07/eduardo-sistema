import { BRAND_COLORS, isBrandColorKey } from "@/app/lib/brandColors";

type Item = { id: string; titulo: string; detalhe: string | null };
type Etapa = { id: string; titulo: string; prazo: string | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: Date) => d.toLocaleDateString("pt-BR");

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildPropostaHtml(props: {
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
}): string {
  const {
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
  } = props;

  const accentStyleAttr =
    corDestaque && isBrandColorKey(corDestaque) ? ` style="--pp-accent: ${BRAND_COLORS[corDestaque].accent}"` : "";

  const mostrarCronograma = !semCronograma && etapas.length > 0;
  const mostrarConceito = Boolean(fraseAbertura || contextoProjeto);
  const mostrarEscopo = itensEscopo.length > 0 || valor != null;
  const secoes = [mostrarConceito, mostrarEscopo, mostrarCronograma];
  const numerosSecao = secoes.reduce<string[]>((acc, ativa) => {
    acc.push(ativa ? String(acc.filter(Boolean).length + 1).padStart(2, "0") : "");
    return acc;
  }, []);

  const logoHtml = logoUrl
    ? `<img src="${esc(logoUrl)}" alt="${esc(nomeProdutora)}" class="h-8 w-8 object-contain" style="height:32px;width:32px;object-fit:contain" />`
    : `<svg viewBox="0 0 1038.81 641.35" style="height:24px;width:24px" fill="currentColor"><path d="M865.13,382.96H27.68c-36.91,0-36.91-55.37,0-55.37h835.07c59.46,0,111.34-43.22,119.02-102.18,9.31-71.37-46.96-133.13-116.65-133.13-36.91,0-36.91-55.37,0-55.37,152.26,0,233.01,184.56,122.27,295.3-32.3,32.3-76.13,50.75-122.27,50.75ZM696.72,641.35c-36.91,0-36.91-55.37,0-55.37,29.99,0,55.37-25.38,55.37-57.68s-25.38-57.68-55.37-57.68h-359.89c-30.58,0-55.37-24.79-55.37-55.37h0s410.6,0,410.6,0c57.6,0,110.66,46.79,115.06,104.23,5.07,66.24-47.61,121.86-110.4,121.86ZM525.66,292.99H122.27c0-30.58,24.79-55.37,55.37-55.37h348.64c45.66,0,88.09-37.05,91.7-82.57,4.28-54.06-38.9-99.68-89.68-99.68-36.91,0-36.91-55.37,0-55.37,82.03,0,147.4,69.06,145.29,151.53-1.99,77.86-70.05,141.46-147.93,141.46Z"/></svg>`;

  const conceitoHtml = mostrarConceito
    ? `<section class="pp-bloco">
        <div class="pp-section-head">
          <span class="pp-section-num">${numerosSecao[0]}</span>
          <div>
            <h2 class="pp-heading pp-section-title">O ponto de partida</h2>
            <p class="pp-section-desc">Contexto da oportunidade e objetivo do projeto.</p>
          </div>
        </div>
        ${fraseAbertura ? `<p class="pp-contexto pp-contexto-abertura">${esc(fraseAbertura)}</p>` : ""}
        ${contextoProjeto ? `<p class="pp-contexto">${esc(contextoProjeto)}</p>` : ""}
      </section>`
    : "";

  const itensHtml =
    itensEscopo.length > 0
      ? `<ul class="pp-itens">
          ${itensEscopo
            .map(
              (item) =>
                `<li class="pp-item"><span class="desc">${esc(item.titulo)}</span>${
                  item.detalhe ? `<span class="detalhe">${esc(item.detalhe)}</span>` : ""
                }</li>`,
            )
            .join("")}
        </ul>`
      : "";

  const investimentoHtml =
    valor != null
      ? `<div class="pp-investimento">
          <span class="label">${recorrente ? "Valor mensal" : "Investimento total"}</span>
          <div class="num-total">${esc(brl(valor))}${recorrente ? `<span class="por-mes"> /mês</span>` : ""}</div>
          ${
            parcelamento && parcelamento > 1
              ? `<p class="parc">Em até ${parcelamento}x de ${esc(brl(valor / parcelamento))} (sem juros)</p>`
              : ""
          }
          ${condicoesPagamento ? `<p class="cond">${esc(condicoesPagamento)}</p>` : ""}
        </div>`
      : "";

  const escopoHtml = mostrarEscopo
    ? `<section class="pp-bloco">
        <div class="pp-section-head">
          <span class="pp-section-num">${numerosSecao[1]}</span>
          <div>
            <h2 class="pp-heading pp-section-title">Escopo e investimento</h2>
            <p class="pp-section-desc">Itens contratados e composição do valor.</p>
          </div>
        </div>
        ${itensHtml}
        ${investimentoHtml}
      </section>`
    : "";

  const cronogramaHtml = mostrarCronograma
    ? `<section class="pp-bloco">
        <div class="pp-section-head">
          <span class="pp-section-num">${numerosSecao[2]}</span>
          <div>
            <h2 class="pp-heading pp-section-title">Cronograma</h2>
            <p class="pp-section-desc">Sequência prevista para alinhamento, produção e entrega.</p>
          </div>
        </div>
        <ul class="pp-timeline">
          ${etapas
            .map(
              (etapa) =>
                `<li class="pp-etapa"><span class="prazo">${esc(etapa.prazo ?? "")}</span><span class="nome">${esc(etapa.titulo)}</span></li>`,
            )
            .join("")}
        </ul>
      </section>`
    : "";

  return `<div class="pp-shell"${accentStyleAttr}>
    <header class="pp-topo">
      <div class="pp-brand">
        ${logoHtml}
        <div>
          <div class="pp-brand-sub">Proposta comercial</div>
          <div class="pp-brand-name">${esc(nomeProdutora)}</div>
        </div>
      </div>
      <div class="pp-meta">
        <div>${esc(numero)}</div>
        ${validade ? `<div>Válida até ${esc(dataBR(validade))}</div>` : ""}
      </div>
    </header>

    <section class="pp-capa">
      <div class="pp-hero">
        <span class="pp-eyebrow">Proposta audiovisual</span>
        <h1 class="pp-heading pp-title">${esc(titulo)}</h1>
        ${clienteNome ? `<p class="pp-cliente">Preparada para ${esc(clienteNome)}</p>` : ""}
        <div class="pp-stats">
          <div class="pp-stat">
            <span class="pp-stat-val">${itensEscopo.length || "—"}</span>
            <span class="pp-stat-label">Itens no escopo</span>
          </div>
          <div class="pp-stat">
            <span class="pp-stat-val">${recorrente ? "Recorrente" : "Fechado"}</span>
            <span class="pp-stat-label">Formato</span>
          </div>
          <div class="pp-stat">
            <span class="pp-stat-val">${validade ? esc(dataBR(validade)) : "—"}</span>
            <span class="pp-stat-label">Validade</span>
          </div>
        </div>
      </div>

      <aside class="pp-client-card">
        <div class="pp-client-top">
          <span class="pp-eyebrow" style="padding-left:0">Preparada para</span>
          <span class="pp-numero-pill">${esc(numero)}</span>
        </div>
        <div class="pp-client-info">
          <div>
            <span class="pp-field-label">Cliente</span>
            <span class="pp-field-val">${clienteNome ? esc(clienteNome) : "—"}</span>
          </div>
        </div>
        <div class="pp-client-footer">
          Esta proposta foi preparada exclusivamente para você.${validade ? ` Válida até ${esc(dataBR(validade))}.` : ""}
        </div>
      </aside>
    </section>

    ${conceitoHtml}
    ${escopoHtml}
    ${cronogramaHtml}

    <footer class="pp-rodape">
      ${
        validade
          ? `<span class="validade">Proposta válida até ${esc(dataBR(validade))}. Depois desse prazo, valores e agenda podem ser revisados.</span>`
          : "<span></span>"
      }
      <span class="assinatura">${esc(nomeProdutora)}</span>
    </footer>
  </div>`;
}
