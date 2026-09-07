"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePropostaPagoManual(propostaId: string, pago: boolean) {
  await prisma.proposta.update({
    where: { id: propostaId },
    data: { pagoManual: pago },
  });
  revalidatePath("/");
}

export async function getProjecaoDoMesDetalhes(mes: string) {
  // mes no formato "YYYY-MM"
  const [ano, mesNum] = mes.split("-").map(Number);
  const inicioMes = new Date(ano, mesNum - 1, 1);
  const fimMes = new Date(ano, mesNum, 1);

  const [lancamentosRaw, propostasRaw] = await Promise.all([
    prisma.lancamento.findMany({
      where: { vencimento: { gte: inicioMes, lt: fimMes }, tipo: "RECEITA" },
      select: { id: true, descricao: true, valor: true, status: true, vencimento: true },
      orderBy: { vencimento: "asc" },
    }),
    prisma.proposta.findMany({
      where: { status: "APROVADA", enviadaEm: { gte: inicioMes, lt: fimMes } },
      select: { id: true, titulo: true, nomeEmpresa: true, nomeCliente: true, valor: true, pagoManual: true },
      orderBy: { valor: "desc" },
    }),
  ]);

  return {
    lancamentos: lancamentosRaw.map((l) => ({
      id: l.id,
      descricao: l.descricao,
      valor: Number(l.valor),
      status: l.status,
      vencimento: l.vencimento.toISOString(),
    })),
    propostas: propostasRaw.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      cliente: p.nomeEmpresa ?? p.nomeCliente ?? "",
      valor: Number(p.valor ?? 0),
      pagoManual: p.pagoManual,
    })),
  };
}
