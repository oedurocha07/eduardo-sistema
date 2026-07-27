import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getConfiguracao } from "@/app/lib/configuracao";
import { buildPropostaHtml } from "../buildPropostaHtml";
import { PP_DOCUMENT_CSS } from "../pp-document-css";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [proposta, config] = await Promise.all([
    prisma.proposta.findUnique({
      where: { id },
      include: {
        lead: { include: { empresa: true } },
        cliente: { include: { empresa: true } },
        itensEscopo: { orderBy: { ordem: "asc" } },
        etapas: { orderBy: { ordem: "asc" } },
      },
    }),
    getConfiguracao(),
  ]);

  if (!proposta) notFound();

  const clienteNome = proposta.lead?.empresa.nome ?? proposta.cliente?.empresa.nome ?? null;
  const numero = `PROP-${proposta.createdAt.getFullYear()}-${proposta.id.slice(0, 4).toUpperCase()}`;

  const corpo = buildPropostaHtml({
    titulo: proposta.titulo,
    clienteNome,
    nomeProdutora: config.nomeProdutora ?? "Avra Produtora LTDA",
    logoUrl: config.logoUrl,
    fraseAbertura: proposta.fraseAbertura,
    contextoProjeto: proposta.contextoProjeto,
    itensEscopo: proposta.itensEscopo,
    etapas: proposta.etapas,
    semCronograma: proposta.semCronograma,
    valor: proposta.valor ? Number(proposta.valor) : null,
    recorrente: proposta.recorrente,
    parcelamento: proposta.parcelamento,
    condicoesPagamento: proposta.condicoesPagamento,
    validade: proposta.validade,
    numero,
    corDestaque: proposta.corDestaque,
  });

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${proposta.titulo} — ${numero}</title>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=chillax@500,600,700&display=swap" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 16px; background: #000000; }
  ${PP_DOCUMENT_CSS}
</style>
</head>
<body class="pp-root">
${corpo}
</body>
</html>`;

  const nomeArquivo = `proposta-${numero.toLowerCase()}.html`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
