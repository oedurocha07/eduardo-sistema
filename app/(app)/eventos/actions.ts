"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { salvarArquivo } from "@/app/lib/storage";
import { parseDataHoraLocal } from "@/app/lib/parseDataHoraLocal";
import {
  StatusEvento,
  FaseChecklist,
  StatusEquipamento,
  TipoCustoEvento,
} from "@/app/generated/prisma/client";
import { CORES_AMBIENTE } from "./constants";

// ---------- Evento ----------
export async function createEvento(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const local = String(formData.get("local") ?? "").trim() || null;
  const dataInicioRaw = String(formData.get("dataInicio") ?? "").trim();
  const dataFimRaw = String(formData.get("dataFim") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim() || null;

  if (!nome || !dataInicioRaw) throw new Error("Nome e data de início são obrigatórios");

  const evento = await prisma.eventoProducao.create({
    data: {
      nome,
      local,
      dataInicio: parseDataHoraLocal(dataInicioRaw),
      dataFim: dataFimRaw ? parseDataHoraLocal(dataFimRaw) : null,
      clienteId,
    },
  });

  revalidatePath("/eventos");
  redirect(`/eventos/${evento.id}`);
}

export async function updateEventoStatus(id: string, status: StatusEvento) {
  await prisma.eventoProducao.update({ where: { id }, data: { status } });
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${id}`);
}

export async function deleteEvento(id: string) {
  await prisma.eventoProducao.delete({ where: { id } });
  revalidatePath("/eventos");
  redirect("/eventos");
}

// ---------- Ambiente ----------
export async function createAmbiente(eventoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome do ambiente é obrigatório");

  const count = await prisma.ambienteEvento.count({ where: { eventoId } });
  await prisma.ambienteEvento.create({
    data: { eventoId, nome, ordem: count, cor: CORES_AMBIENTE[count % CORES_AMBIENTE.length] },
  });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteAmbiente(id: string, eventoId: string) {
  await prisma.ambienteEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Bloco operacional ----------
export async function createBloco(eventoId: string, formData: FormData) {
  const ambienteId = String(formData.get("ambienteId") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const inicioRaw = String(formData.get("inicio") ?? "").trim();
  const fimRaw = String(formData.get("fim") ?? "").trim();
  const responsavel = String(formData.get("responsavel") ?? "").trim() || null;

  if (!ambienteId || !titulo || !inicioRaw || !fimRaw) {
    throw new Error("Ambiente, título e horários são obrigatórios");
  }

  await prisma.blocoOperacional.create({
    data: { ambienteId, titulo, inicio: parseDataHoraLocal(inicioRaw), fim: parseDataHoraLocal(fimRaw), responsavel },
  });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteBloco(id: string, eventoId: string) {
  await prisma.blocoOperacional.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Equipe ----------
export async function createMembro(eventoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const funcao = String(formData.get("funcao") ?? "").trim();
  const diaRaw = String(formData.get("dia") ?? "").trim();
  const cacheRaw = String(formData.get("cache") ?? "").trim();
  const contato = String(formData.get("contato") ?? "").trim() || null;

  if (!nome || !funcao) throw new Error("Nome e função são obrigatórios");

  await prisma.membroEquipeEvento.create({
    data: {
      eventoId,
      nome,
      funcao,
      dia: diaRaw ? new Date(diaRaw) : null,
      cache: cacheRaw ? Number(cacheRaw) : null,
      contato,
    },
  });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteMembro(id: string, eventoId: string) {
  await prisma.membroEquipeEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Equipamentos ----------
export async function createEquipamento(eventoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const responsavel = String(formData.get("responsavel") ?? "").trim() || null;
  const quantidadeRaw = String(formData.get("quantidade") ?? "1").trim();

  if (!nome) throw new Error("Nome do equipamento é obrigatório");

  await prisma.equipamentoEvento.create({
    data: { eventoId, nome, responsavel, quantidade: Number(quantidadeRaw) || 1 },
  });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function updateEquipamentoStatus(id: string, eventoId: string, status: StatusEquipamento) {
  await prisma.equipamentoEvento.update({ where: { id }, data: { status } });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteEquipamento(id: string, eventoId: string) {
  await prisma.equipamentoEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Checklist ----------
export async function createChecklistItem(eventoId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const fase = String(formData.get("fase") ?? "PREPARACAO") as FaseChecklist;
  if (!titulo) throw new Error("Título é obrigatório");

  await prisma.checklistItemEvento.create({ data: { eventoId, titulo, fase } });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function toggleChecklistItem(id: string, eventoId: string, concluido: boolean) {
  await prisma.checklistItemEvento.update({ where: { id }, data: { concluido } });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteChecklistItem(id: string, eventoId: string) {
  await prisma.checklistItemEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Custos ----------
export async function createCusto(eventoId: string, formData: FormData) {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "OUTRO") as TipoCustoEvento;
  const valorRaw = String(formData.get("valor") ?? "").trim();

  if (!descricao || !valorRaw) throw new Error("Descrição e valor são obrigatórios");

  await prisma.custoEvento.create({ data: { eventoId, descricao, tipo, valor: Number(valorRaw) } });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteCusto(id: string, eventoId: string) {
  await prisma.custoEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}

// ---------- Referências ----------
export async function createReferencia(eventoId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const arquivo = formData.get("arquivo") as File | null;

  if (!titulo) throw new Error("Título é obrigatório");

  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : null;

  await prisma.referenciaEvento.create({ data: { eventoId, titulo, url, arquivoUrl } });
  revalidatePath(`/eventos/${eventoId}`);
}

export async function deleteReferencia(id: string, eventoId: string) {
  await prisma.referenciaEvento.delete({ where: { id } });
  revalidatePath(`/eventos/${eventoId}`);
}
