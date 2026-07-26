"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { salvarArquivo } from "@/app/lib/storage";

function revalidarOrcamento(id?: string) {
  revalidatePath("/orcamentos");
  if (id) revalidatePath(`/orcamentos/${id}`);
}

export async function createOrcamento(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "Projeto Personalizado").trim();

  if (!nome) throw new Error("Nome é obrigatório");

  const orcamento = await prisma.orcamento.create({ data: { nome, categoria } });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}`);
}

export async function updateOrcamentoDetalhes(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const alvo = String(formData.get("alvo") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório");

  const [tipoAlvo, idAlvo] = alvo.split(":");
  const leadId = tipoAlvo === "lead" ? idAlvo : null;
  const clienteId = tipoAlvo === "cliente" ? idAlvo : null;

  await prisma.orcamento.update({ where: { id }, data: { nome, leadId, clienteId } });
  revalidarOrcamento(id);
}

export async function updateMargem(id: string, margemPercentual: number) {
  await prisma.orcamento.update({ where: { id }, data: { margemPercentual } });
  revalidarOrcamento(id);
}

export async function toggleMostrarDetalhado(id: string, mostrarDetalhado: boolean) {
  await prisma.orcamento.update({ where: { id }, data: { mostrarDetalhado } });
  revalidarOrcamento(id);
}

export async function uploadArquivoOrcamento(id: string, formData: FormData) {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) throw new Error("Selecione um arquivo");

  const arquivoUrl = await salvarArquivo(arquivo);
  await prisma.orcamento.update({ where: { id }, data: { arquivoUrl } });
  revalidarOrcamento(id);
}

export async function deleteOrcamento(id: string) {
  await prisma.orcamento.delete({ where: { id } });
  revalidatePath("/orcamentos");
  redirect("/orcamentos");
}

// ---------- Itens do orçamento ----------
export async function addItemDoCatalogo(orcamentoId: string, itemCatalogoId: string) {
  const item = await prisma.itemCatalogo.findUnique({ where: { id: itemCatalogoId } });
  if (!item) throw new Error("Item não encontrado no catálogo");

  const count = await prisma.itemOrcamento.count({ where: { orcamentoId } });
  await prisma.itemOrcamento.create({
    data: {
      orcamentoId,
      itemCatalogoId: item.id,
      nome: item.nome,
      custoUnitario: item.precoBase,
      quantidade: 1,
      ordem: count,
    },
  });
  revalidarOrcamento(orcamentoId);
}

export async function addItemAvulso(orcamentoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const custoUnitario = Number(formData.get("custoUnitario") ?? 0);
  if (!nome) throw new Error("Nome do item é obrigatório");

  const count = await prisma.itemOrcamento.count({ where: { orcamentoId } });
  await prisma.itemOrcamento.create({
    data: { orcamentoId, nome, custoUnitario, quantidade: 1, ordem: count },
  });
  revalidarOrcamento(orcamentoId);
}

export async function updateItemOrcamentoQuantidade(id: string, orcamentoId: string, quantidade: number) {
  await prisma.itemOrcamento.update({ where: { id }, data: { quantidade: Math.max(1, quantidade) } });
  revalidarOrcamento(orcamentoId);
}

export async function deleteItemOrcamento(id: string, orcamentoId: string) {
  await prisma.itemOrcamento.delete({ where: { id } });
  revalidarOrcamento(orcamentoId);
}

// ---------- Ações do orçamento ----------
function calcularValores(itens: { custoUnitario: unknown; quantidade: number }[], margemPercentual: unknown) {
  const custoOperacional = itens.reduce((s, i) => s + Number(i.custoUnitario) * i.quantidade, 0);
  const margem = Number(margemPercentual) / 100;
  const precoSugerido = margem < 1 ? custoOperacional / (1 - margem) : custoOperacional;
  return { custoOperacional, precoSugerido };
}

export async function duplicarOrcamento(id: string) {
  const original = await prisma.orcamento.findUnique({ where: { id }, include: { itens: true } });
  if (!original) throw new Error("Orçamento não encontrado");

  const copia = await prisma.orcamento.create({
    data: {
      nome: `${original.nome} (cópia)`,
      categoria: original.categoria,
      leadId: original.leadId,
      clienteId: original.clienteId,
      margemPercentual: original.margemPercentual,
      mostrarDetalhado: original.mostrarDetalhado,
      itens: {
        create: original.itens.map((i) => ({
          itemCatalogoId: i.itemCatalogoId,
          nome: i.nome,
          custoUnitario: i.custoUnitario,
          quantidade: i.quantidade,
          ordem: i.ordem,
        })),
      },
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${copia.id}`);
}

export async function salvarComoTemplate(id: string) {
  await prisma.orcamento.update({ where: { id }, data: { isTemplate: true } });
  revalidarOrcamento(id);
}

export async function criarProjetoDoOrcamento(id: string) {
  const orcamento = await prisma.orcamento.findUnique({ where: { id }, include: { itens: true } });
  if (!orcamento) throw new Error("Orçamento não encontrado");
  if (!orcamento.clienteId) throw new Error("Vincule um cliente ao orçamento antes de criar o projeto");

  const { precoSugerido } = calcularValores(orcamento.itens, orcamento.margemPercentual);

  const projeto = await prisma.projeto.create({
    data: { nome: orcamento.nome, clienteId: orcamento.clienteId, valor: precoSugerido },
  });

  redirect(`/projetos/${orcamento.clienteId}/${projeto.id}`);
}

export async function gerarPropostaDoOrcamento(id: string) {
  const orcamento = await prisma.orcamento.findUnique({ where: { id }, include: { itens: true } });
  if (!orcamento) throw new Error("Orçamento não encontrado");

  const { precoSugerido } = calcularValores(orcamento.itens, orcamento.margemPercentual);

  const proposta = await prisma.proposta.create({
    data: {
      titulo: orcamento.nome,
      leadId: orcamento.leadId,
      clienteId: orcamento.clienteId,
      valor: precoSugerido,
      itensEscopo: {
        create: orcamento.itens.map((i, idx) => ({
          titulo: i.nome,
          detalhe: i.quantidade > 1 ? `${i.quantidade}x` : null,
          ordem: idx,
        })),
      },
    },
  });

  redirect(`/propostas/${proposta.id}`);
}

// ---------- Catálogo de preços ----------
export async function createItemCatalogo(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim() || "Geral";
  const unidade = String(formData.get("unidade") ?? "").trim() || "unidade";
  const precoBase = Number(formData.get("precoBase") ?? 0);
  if (!nome) throw new Error("Nome é obrigatório");

  const count = await prisma.itemCatalogo.count();
  await prisma.itemCatalogo.create({ data: { nome, categoria, unidade, precoBase, ordem: count } });
  revalidatePath("/orcamentos");
}

export async function updateItemCatalogo(id: string, nome: string, precoBase: number, unidade: string) {
  if (!nome.trim()) throw new Error("Nome é obrigatório");
  await prisma.itemCatalogo.update({ where: { id }, data: { nome: nome.trim(), precoBase, unidade } });
  revalidatePath("/orcamentos");
}

export async function deleteItemCatalogo(id: string) {
  await prisma.itemCatalogo.delete({ where: { id } });
  revalidatePath("/orcamentos");
}
