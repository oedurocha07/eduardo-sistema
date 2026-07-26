import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

type LancamentoPayload = {
  asaasPaymentId: string;
  asaasCustomerId?: string | null;
  valor: number;
  dataPagamento: string;
  formaPagamento?: string | null;
  descricao?: string | null;
};

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.LANCAMENTOS_API_KEY) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: LancamentoPayload = await request.json();

  if (!body.asaasPaymentId || !body.valor || !body.dataPagamento) {
    return Response.json({ error: "asaasPaymentId, valor e dataPagamento são obrigatórios" }, { status: 400 });
  }

  const clienteRecorrente = body.asaasCustomerId
    ? await prisma.clienteRecorrente.findFirst({ where: { idClienteAsaas: body.asaasCustomerId } })
    : null;

  let carteira = await prisma.carteira.findFirst({ orderBy: { createdAt: "asc" } });
  if (!carteira) {
    carteira = await prisma.carteira.create({ data: { nome: "Empresa" } });
  }

  const descricao = clienteRecorrente?.nome ?? body.descricao ?? "Recebimento Asaas";

  const lancamento = await prisma.lancamento.upsert({
    where: { asaasPaymentId: body.asaasPaymentId },
    create: {
      tipo: "RECEITA",
      descricao,
      categoria: clienteRecorrente ? "Cliente recorrente" : null,
      valor: body.valor,
      vencimento: new Date(body.dataPagamento),
      status: "PAGO",
      formaPagamento: body.formaPagamento ?? null,
      carteiraId: carteira.id,
      clienteRecorrenteId: clienteRecorrente?.id ?? null,
      asaasPaymentId: body.asaasPaymentId,
      origemIntegracao: "asaas",
    },
    update: {
      descricao,
      valor: body.valor,
      vencimento: new Date(body.dataPagamento),
      formaPagamento: body.formaPagamento ?? null,
      clienteRecorrenteId: clienteRecorrente?.id ?? null,
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
  revalidatePath("/");

  return Response.json({ ok: true, lancamentoId: lancamento.id, clienteVinculado: Boolean(clienteRecorrente) });
}
