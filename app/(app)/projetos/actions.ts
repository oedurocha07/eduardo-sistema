"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { EtapaProducao } from "@/app/generated/prisma/client";

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

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${clienteId}`);
}

export async function updateProjetoStatus(id: string, status: EtapaProducao) {
  const projeto = await prisma.projeto.update({ where: { id }, data: { status } });
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${projeto.clienteId}`);
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

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${projeto.projeto.clienteId}`);
}

export async function toggleTarefa(id: string, concluida: boolean) {
  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: { concluida },
    include: { projeto: true },
  });
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${tarefa.projeto.clienteId}`);
}

export async function deleteTarefa(id: string) {
  const tarefa = await prisma.tarefa.delete({ where: { id }, include: { projeto: true } });
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${tarefa.projeto.clienteId}`);
}

export async function arquivarCliente(id: string, ativo: boolean) {
  await prisma.cliente.update({ where: { id }, data: { ativo } });
  revalidatePath("/projetos");
}
