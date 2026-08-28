import { prisma } from "@/app/lib/prisma";
import { parseDataHoraLocal } from "@/app/lib/parseDataHoraLocal";
import { revalidatePath } from "next/cache";

type LancamentoNotionPayload = {
  notionPageId: string;
  descricao: string;
  tipo: "RECEITA" | "DESPESA";
  valor: number;
  vencimento: string;
  pago: boolean;
  categoria?: string | null;
};

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.FINANCEIRO_SYNC_API_KEY) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: { lancamentos: LancamentoNotionPayload[] } = await request.json();
  const lancamentos = Array.isArray(body.lancamentos) ? body.lancamentos : [];

  let carteira = await prisma.carteira.findFirst({ orderBy: { createdAt: "asc" } });
  if (!carteira) {
    carteira = await prisma.carteira.create({ data: { nome: "Empresa" } });
  }

  let sincronizados = 0;
  for (const l of lancamentos) {
    if (!l.notionPageId || !l.descricao || !l.valor || !l.vencimento) continue;
    if (l.tipo !== "RECEITA" && l.tipo !== "DESPESA") continue;

    await prisma.lancamento.upsert({
      where: { notionPageId: l.notionPageId },
      create: {
        notionPageId: l.notionPageId,
        tipo: l.tipo,
        descricao: l.descricao,
        categoria: l.categoria ?? null,
        valor: l.valor,
        vencimento: parseDataHoraLocal(l.vencimento),
        status: l.pago ? "PAGO" : "PENDENTE",
        carteiraId: carteira.id,
        origemIntegracao: "notion",
      },
      update: {
        tipo: l.tipo,
        descricao: l.descricao,
        categoria: l.categoria ?? null,
        valor: l.valor,
        vencimento: parseDataHoraLocal(l.vencimento),
        status: l.pago ? "PAGO" : "PENDENTE",
      },
    });
    sincronizados++;
  }

  // Seguranca: nunca podar registros existentes se a lista recebida vier vazia.
  // Uma lista vazia quase sempre significa falha/instabilidade na origem (Notion),
  // nao que tudo deva ser removido -- sem essa guarda, um payload vazio apagaria
  // TODOS os lancamentos sincronizados do Notion de uma vez.
  let removidosCount = 0;
  const idsAtuais = lancamentos.map((l) => l.notionPageId).filter(Boolean);
  if (idsAtuais.length > 0) {
    const removidos = await prisma.lancamento.deleteMany({
      where: {
        notionPageId: { not: null, notIn: idsAtuais },
      },
    });
    removidosCount = removidos.count;
  }

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
  revalidatePath("/");

  return Response.json({ ok: true, sincronizados, removidos: removidosCount });
}
