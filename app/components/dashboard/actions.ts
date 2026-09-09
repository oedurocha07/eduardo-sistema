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

export async function updateRecorrentePagoMes(clienteRecorrenteId: string, mes: string, pago: boolean) {
  await prisma.recorrentePagoMes.upsert({
    where: { clienteRecorrenteId_mes: { clienteRecorrenteId, mes } },
    create: { clienteRecorrenteId, mes, pago },
    update: { pago },
  });
  revalidatePath("/");
}

export async function getProjecaoDoMesDetalhes(mes: string) {
  // mes no formato "YYYY-MM"
  const [ano, mesNum] = mes.split("-").map(Number);
  // Lancamento.vencimento é literal, gravada forçada em UTC (ver parseDataHoraLocal) —
  // fronteira precisa ser ancorada em UTC. Proposta.enviadaEm já é timestamp real (new
  // Date() no momento em que é marcada Enviada) — fronteira fica no fuso local do
  // container, igual qualquer timestamp real.
  const inicioMesUtc = new Date(Date.UTC(ano, mesNum - 1, 1));
  const fimMesUtc = new Date(Date.UTC(ano, mesNum, 1));
  const inicioMesLocal = new Date(ano, mesNum - 1, 1);
  const fimMesLocal = new Date(ano, mesNum, 1);

  const [lancamentosRaw, propostasRaw, recorrentesRaw, pagosMesRaw] = await Promise.all([
    prisma.lancamento.findMany({
      where: { vencimento: { gte: inicioMesUtc, lt: fimMesUtc }, tipo: "RECEITA" },
      select: { id: true, descricao: true, valor: true, status: true, vencimento: true },
      orderBy: { vencimento: "asc" },
    }),
    prisma.proposta.findMany({
      where: { status: "APROVADA", enviadaEm: { gte: inicioMesLocal, lt: fimMesLocal } },
      select: { id: true, titulo: true, nomeEmpresa: true, nomeCliente: true, valor: true, pagoManual: true },
      orderBy: { valor: "desc" },
    }),
    prisma.clienteRecorrente.findMany({
      where: { status: "ATIVO", recorrente: true },
      select: { id: true, nome: true, valorMensal: true },
      orderBy: { valorMensal: "desc" },
    }),
    prisma.recorrentePagoMes.findMany({ where: { mes } }),
  ]);

  const pagoMap = new Map(pagosMesRaw.map((p) => [p.clienteRecorrenteId, p.pago]));

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
    recorrentes: recorrentesRaw.map((r) => ({
      id: r.id,
      nome: r.nome,
      valorMensal: Number(r.valorMensal ?? 0),
      pago: pagoMap.get(r.id) ?? false,
    })),
  };
}
