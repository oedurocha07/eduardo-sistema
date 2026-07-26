"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { TipoLancamento } from "@/app/generated/prisma/client";
import { salvarArquivo } from "@/app/lib/storage";

function lerCamposLancamento(formData: FormData) {
  const tipo = String(formData.get("tipo")) as TipoLancamento;
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim() || null;
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const vencimentoRaw = String(formData.get("vencimento") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim() || null;
  const projetoId = String(formData.get("projetoId") ?? "").trim() || null;
  const formaPagamento = String(formData.get("formaPagamento") ?? "").trim() || null;

  if (!descricao || !valorRaw || !vencimentoRaw) {
    throw new Error("Descrição, valor e vencimento são obrigatórios");
  }

  return {
    tipo,
    descricao,
    categoria,
    valor: Number(valorRaw),
    vencimento: new Date(vencimentoRaw),
    clienteId,
    projetoId,
    formaPagamento,
  };
}

function revalidarFinanceiro() {
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
  revalidatePath("/financeiro/projetos");
}

export async function createLancamento(formData: FormData) {
  const campos = lerCamposLancamento(formData);
  const comprovante = formData.get("comprovante") as File | null;
  const comprovanteUrl = comprovante && comprovante.size > 0 ? await salvarArquivo(comprovante) : null;

  let carteira = await prisma.carteira.findFirst({ orderBy: { createdAt: "asc" } });
  if (!carteira) {
    carteira = await prisma.carteira.create({ data: { nome: "Empresa" } });
  }

  await prisma.lancamento.create({
    data: { ...campos, comprovanteUrl, carteiraId: carteira.id },
  });

  revalidarFinanceiro();
}

export async function updateLancamento(id: string, formData: FormData) {
  const campos = lerCamposLancamento(formData);
  const comprovante = formData.get("comprovante") as File | null;
  const novoComprovanteUrl = comprovante && comprovante.size > 0 ? await salvarArquivo(comprovante) : undefined;

  await prisma.lancamento.update({
    where: { id },
    data: {
      ...campos,
      ...(novoComprovanteUrl ? { comprovanteUrl: novoComprovanteUrl } : {}),
    },
  });

  revalidarFinanceiro();
}

export async function deleteLancamento(id: string) {
  await prisma.lancamento.delete({ where: { id } });
  revalidarFinanceiro();
}

export async function marcarPago(id: string) {
  await prisma.lancamento.update({ where: { id }, data: { status: "PAGO" } });
  revalidarFinanceiro();
}

export async function desfazerPagamento(id: string) {
  await prisma.lancamento.update({ where: { id }, data: { status: "PENDENTE" } });
  revalidarFinanceiro();
}
