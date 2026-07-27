"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { StatusProposta } from "@/app/generated/prisma/client";
import { salvarArquivo } from "@/app/lib/storage";

function revalidarProposta(id: string) {
  revalidatePath("/propostas");
  revalidatePath(`/propostas/${id}`);
}

export async function createProposta(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const alvo = String(formData.get("alvo") ?? "").trim();

  if (!titulo) throw new Error("Título é obrigatório");

  const [tipoAlvo, idAlvo] = alvo.split(":");
  const leadId = tipoAlvo === "lead" ? idAlvo : null;
  const clienteId = tipoAlvo === "cliente" ? idAlvo : null;

  const proposta = await prisma.proposta.create({
    data: { titulo, leadId, clienteId },
  });

  revalidatePath("/propostas");
  redirect(`/propostas/${proposta.id}`);
}

export async function updatePropostaStatus(id: string, status: StatusProposta) {
  await prisma.proposta.update({ where: { id }, data: { status } });
  revalidarProposta(id);
}

export async function deleteProposta(id: string) {
  await prisma.proposta.delete({ where: { id } });
  revalidatePath("/propostas");
  redirect("/propostas");
}

export async function updatePropostaGeral(id: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const alvo = String(formData.get("alvo") ?? "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  const [tipoAlvo, idAlvo] = alvo.split(":");
  const leadId = tipoAlvo === "lead" ? idAlvo : null;
  const clienteId = tipoAlvo === "cliente" ? idAlvo : null;

  await prisma.proposta.update({ where: { id }, data: { titulo, leadId, clienteId } });
  revalidarProposta(id);
}

export async function updatePropostaConceito(id: string, formData: FormData) {
  const fraseAbertura = String(formData.get("fraseAbertura") ?? "").trim() || null;
  const contextoProjeto = String(formData.get("contextoProjeto") ?? "").trim() || null;
  await prisma.proposta.update({ where: { id }, data: { fraseAbertura, contextoProjeto } });
  revalidarProposta(id);
}

export async function updatePropostaSemCronograma(id: string, semCronograma: boolean) {
  await prisma.proposta.update({ where: { id }, data: { semCronograma } });
  revalidarProposta(id);
}

export async function updatePropostaInvestimento(id: string, formData: FormData) {
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const validadeRaw = String(formData.get("validade") ?? "").trim();
  const parcelamentoRaw = String(formData.get("parcelamento") ?? "").trim();
  const condicoesPagamento = String(formData.get("condicoesPagamento") ?? "").trim() || null;
  const recorrente = formData.get("recorrente") === "on";
  const margemRaw = String(formData.get("margemDesejada") ?? "").trim();

  await prisma.proposta.update({
    where: { id },
    data: {
      valor: valorRaw ? Number(valorRaw) : null,
      validade: validadeRaw ? new Date(validadeRaw) : null,
      parcelamento: parcelamentoRaw ? Number(parcelamentoRaw) : null,
      condicoesPagamento,
      recorrente,
      margemDesejada: margemRaw ? Number(margemRaw) : null,
    },
  });
  revalidarProposta(id);
}

export async function uploadArquivoProposta(id: string, formData: FormData) {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) throw new Error("Selecione um arquivo");

  const arquivoUrl = await salvarArquivo(arquivo);
  await prisma.proposta.update({ where: { id }, data: { arquivoUrl } });
  revalidarProposta(id);
}

// ---------- Escopo ----------
export async function createItemEscopo(propostaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const detalhe = String(formData.get("detalhe") ?? "").trim() || null;
  const custoInternoRaw = String(formData.get("custoInterno") ?? "").trim();
  if (!titulo) throw new Error("Título do item é obrigatório");

  const count = await prisma.itemEscopoProposta.count({ where: { propostaId } });
  await prisma.itemEscopoProposta.create({
    data: {
      propostaId,
      titulo,
      detalhe,
      custoInterno: custoInternoRaw ? Number(custoInternoRaw) : null,
      ordem: count,
    },
  });
  revalidarProposta(propostaId);
}

export async function deleteItemEscopo(id: string, propostaId: string) {
  await prisma.itemEscopoProposta.delete({ where: { id } });
  revalidarProposta(propostaId);
}

export async function updateItemEscopo(
  id: string,
  propostaId: string,
  titulo: string,
  detalhe: string,
  custoInterno: number | null,
) {
  if (!titulo.trim()) throw new Error("Título do item é obrigatório");
  await prisma.itemEscopoProposta.update({
    where: { id },
    data: { titulo: titulo.trim(), detalhe: detalhe.trim() || null, custoInterno },
  });
  revalidarProposta(propostaId);
}

// ---------- Cronograma ----------
export async function createEtapaCronograma(propostaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const prazo = String(formData.get("prazo") ?? "").trim() || null;
  if (!titulo) throw new Error("Título da etapa é obrigatório");

  const count = await prisma.etapaCronogramaProposta.count({ where: { propostaId } });
  await prisma.etapaCronogramaProposta.create({ data: { propostaId, titulo, prazo, ordem: count } });
  revalidarProposta(propostaId);
}

export async function deleteEtapaCronograma(id: string, propostaId: string) {
  await prisma.etapaCronogramaProposta.delete({ where: { id } });
  revalidarProposta(propostaId);
}
