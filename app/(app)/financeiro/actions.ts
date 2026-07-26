"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { TipoLancamento } from "@/app/generated/prisma/client";

export async function createLancamento(formData: FormData) {
  const tipo = String(formData.get("tipo")) as TipoLancamento;
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim() || null;
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const vencimentoRaw = String(formData.get("vencimento") ?? "").trim();

  if (!descricao || !valorRaw || !vencimentoRaw) {
    throw new Error("Descrição, valor e vencimento são obrigatórios");
  }

  let carteira = await prisma.carteira.findFirst({ orderBy: { createdAt: "asc" } });
  if (!carteira) {
    carteira = await prisma.carteira.create({ data: { nome: "Empresa" } });
  }

  await prisma.lancamento.create({
    data: {
      tipo,
      descricao,
      categoria,
      valor: Number(valorRaw),
      vencimento: new Date(vencimentoRaw),
      carteiraId: carteira.id,
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
}

export async function marcarPago(id: string) {
  await prisma.lancamento.update({ where: { id }, data: { status: "PAGO" } });
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
}
