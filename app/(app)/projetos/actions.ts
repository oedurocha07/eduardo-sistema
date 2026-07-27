"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { EtapaProducao } from "@/app/generated/prisma/client";

function revalidarProjeto(clienteId: string, projetoId?: string) {
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${clienteId}`);
  if (projetoId) revalidatePath(`/projetos/${clienteId}/${projetoId}`);
}

export async function createProjeto(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const dataEntregaRaw = String(formData.get("dataEntrega") ?? "").trim();

  if (!nome || !clienteId) {
    throw new Error("Nome e cliente são obrigatórios");
  }

  await prisma.projeto.create({
    data: {
      nome,
      clienteId,
      dataEntrega: dataEntregaRaw ? new Date(dataEntregaRaw) : null,
    },
  });

  revalidarProjeto(clienteId);
}

export async function updateProjetoStatus(id: string, status: EtapaProducao) {
  const projeto = await prisma.projeto.update({ where: { id }, data: { status } });
  revalidarProjeto(projeto.clienteId, projeto.id);
}

export async function updateProjetoDetalhes(id: string, clienteId: string, formData: FormData) {
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const dataEntregaRaw = String(formData.get("dataEntrega") ?? "").trim();
  const briefing = String(formData.get("briefing") ?? "").trim() || null;
  const areaClienteNotas = String(formData.get("areaClienteNotas") ?? "").trim() || null;

  await prisma.projeto.update({
    where: { id },
    data: {
      valor: valorRaw ? Number(valorRaw) : null,
      dataEntrega: dataEntregaRaw ? new Date(dataEntregaRaw) : null,
      briefing,
      areaClienteNotas,
    },
  });

  revalidarProjeto(clienteId, id);
}

export async function createTarefa(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const projetoId = String(formData.get("projetoId") ?? "").trim();
  const prazoRaw = String(formData.get("prazo") ?? "").trim();

  if (!titulo || !projetoId) throw new Error("Título e projeto são obrigatórios");

  const projeto = await prisma.tarefa.create({
    data: { titulo, projetoId, prazo: prazoRaw ? new Date(prazoRaw) : null },
    include: { projeto: true },
  });

  revalidarProjeto(projeto.projeto.clienteId, projetoId);
}

export async function toggleTarefa(id: string, concluida: boolean) {
  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: { concluida },
    include: { projeto: true },
  });
  revalidarProjeto(tarefa.projeto.clienteId, tarefa.projetoId);
}

export async function deleteTarefa(id: string) {
  const tarefa = await prisma.tarefa.delete({ where: { id }, include: { projeto: true } });
  revalidarProjeto(tarefa.projeto.clienteId, tarefa.projetoId);
}

export async function arquivarCliente(id: string, ativo: boolean) {
  await prisma.cliente.update({ where: { id }, data: { ativo } });
  revalidatePath("/projetos");
}

export async function arquivarProjeto(id: string, clienteId: string, arquivado: boolean) {
  await prisma.projeto.update({ where: { id }, data: { arquivado } });
  revalidarProjeto(clienteId, id);
}

export async function deleteProjeto(id: string, clienteId: string) {
  const lancamentos = await prisma.lancamento.count({ where: { projetoId: id } });
  if (lancamentos > 0) {
    throw new Error("Não é possível excluir: existem lançamentos financeiros vinculados a este projeto.");
  }
  await prisma.projeto.delete({ where: { id } });
  revalidarProjeto(clienteId);
}

export async function deleteCliente(id: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      _count: { select: { projetos: true, lancamentos: true, propostas: true, orcamentos: true, documentos: true, eventos: true } },
    },
  });
  if (!cliente) return;

  const total = Object.values(cliente._count).reduce((s, n) => s + n, 0);
  if (total > 0) {
    throw new Error(
      "Não é possível excluir: esse cliente tem projetos, financeiro, propostas ou documentos vinculados. Apague-os primeiro ou arquive o cliente.",
    );
  }

  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/projetos");
}

// ---------- Entregáveis ----------
export async function createEntregavel(projetoId: string, clienteId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  await prisma.entregavelProjeto.create({ data: { projetoId, titulo } });
  revalidarProjeto(clienteId, projetoId);
}

export async function toggleEntregavel(id: string, clienteId: string, projetoId: string, entregue: boolean) {
  await prisma.entregavelProjeto.update({ where: { id }, data: { entregue } });
  revalidarProjeto(clienteId, projetoId);
}

export async function deleteEntregavel(id: string, clienteId: string, projetoId: string) {
  await prisma.entregavelProjeto.delete({ where: { id } });
  revalidarProjeto(clienteId, projetoId);
}

// ---------- Marcos ----------
export async function createMarco(projetoId: string, clienteId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const dataRaw = String(formData.get("data") ?? "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  await prisma.marcoProjeto.create({
    data: { projetoId, titulo, data: dataRaw ? new Date(dataRaw) : null },
  });
  revalidarProjeto(clienteId, projetoId);
}

export async function toggleMarco(id: string, clienteId: string, projetoId: string, concluido: boolean) {
  await prisma.marcoProjeto.update({ where: { id }, data: { concluido } });
  revalidarProjeto(clienteId, projetoId);
}

export async function deleteMarco(id: string, clienteId: string, projetoId: string) {
  await prisma.marcoProjeto.delete({ where: { id } });
  revalidarProjeto(clienteId, projetoId);
}

// ---------- Equipe do projeto ----------
export async function createMembroProjeto(projetoId: string, clienteId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const funcao = String(formData.get("funcao") ?? "").trim();
  const cacheRaw = String(formData.get("cache") ?? "").trim();
  const contato = String(formData.get("contato") ?? "").trim() || null;

  if (!nome || !funcao) throw new Error("Nome e função são obrigatórios");

  await prisma.membroEquipeProjeto.create({
    data: { projetoId, nome, funcao, cache: cacheRaw ? Number(cacheRaw) : null, contato },
  });
  revalidarProjeto(clienteId, projetoId);
}

export async function deleteMembroProjeto(id: string, clienteId: string, projetoId: string) {
  await prisma.membroEquipeProjeto.delete({ where: { id } });
  revalidarProjeto(clienteId, projetoId);
}
