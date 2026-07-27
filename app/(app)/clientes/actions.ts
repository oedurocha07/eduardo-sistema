"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { StatusClienteRecorrente } from "@/app/generated/prisma/client";
import { criarClienteAsaas } from "@/app/lib/n8n";
import { extrairDadosCartaoCnpj } from "@/app/lib/cartaoCnpj";

function parseNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  return s ? Number(s) : null;
}

function parseStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function createCliente(formData: FormData) {
  const nome = parseStr(formData.get("nome"));
  if (!nome) throw new Error("Nome é obrigatório");

  const cnpjCpf = parseStr(formData.get("cnpjCpf"));
  const email = parseStr(formData.get("email"));
  const idClienteAsaasManual = parseStr(formData.get("idClienteAsaas"));

  const cliente = await prisma.clienteRecorrente.create({
    data: {
      nome,
      cnpjCpf,
      email,
      endereco: parseStr(formData.get("endereco")),
      status: (formData.get("status") as StatusClienteRecorrente) ?? "ATIVO",
      recorrente: formData.get("recorrente") === "on",
      valorMensal: parseNum(formData.get("valorMensal")),
      diaVencimento: parseNum(formData.get("diaVencimento")),
      descricaoServico: parseStr(formData.get("descricaoServico")),
      descricaoNbs: parseStr(formData.get("descricaoNbs")),
      codigoServicoMunicipal: parseStr(formData.get("codigoServicoMunicipal")),
      idClienteAsaas: idClienteAsaasManual,
      enviarFaturaLocacao: formData.get("enviarFaturaLocacao") === "on",
      observacoes: parseStr(formData.get("observacoes")),
    },
  });

  // Se já veio com um ID do Asaas preenchido manualmente, respeita e não cria de novo lá.
  if (!idClienteAsaasManual) {
    const criado = await criarClienteAsaas({ nome, cnpjCpf, email });
    if (criado) {
      await prisma.clienteRecorrente.update({ where: { id: cliente.id }, data: { idClienteAsaas: criado.id } });
    }
  }

  revalidatePath("/clientes");
}

type ResultadoExtracaoCnpj =
  | { ok: true; nome: string | null; cnpj: string | null; endereco: string | null }
  | { ok: false; erro: string };

export async function extrairCartaoCnpj(formData: FormData): Promise<ResultadoExtracaoCnpj> {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return { ok: false, erro: "Nenhum arquivo enviado" };
  if (arquivo.type !== "application/pdf") return { ok: false, erro: "Envie um PDF do Cartão CNPJ" };

  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const dados = await extrairDadosCartaoCnpj(buffer);
    if (!dados.nome && !dados.cnpj) {
      return {
        ok: false,
        erro: "Não consegui identificar os dados nesse PDF. Confira se é o Cartão CNPJ da Receita Federal, ou preencha manualmente.",
      };
    }
    return { ok: true, ...dados };
  } catch (e) {
    console.error("Erro ao extrair Cartão CNPJ:", e);
    return { ok: false, erro: "Erro ao ler o PDF. Preencha manualmente." };
  }
}

export async function updateCliente(formData: FormData) {
  const id = String(formData.get("id"));
  const nome = parseStr(formData.get("nome"));
  if (!id || !nome) throw new Error("Nome é obrigatório");

  await prisma.clienteRecorrente.update({
    where: { id },
    data: {
      nome,
      cnpjCpf: parseStr(formData.get("cnpjCpf")),
      email: parseStr(formData.get("email")),
      endereco: parseStr(formData.get("endereco")),
      status: (formData.get("status") as StatusClienteRecorrente) ?? "ATIVO",
      recorrente: formData.get("recorrente") === "on",
      valorMensal: parseNum(formData.get("valorMensal")),
      diaVencimento: parseNum(formData.get("diaVencimento")),
      descricaoServico: parseStr(formData.get("descricaoServico")),
      descricaoNbs: parseStr(formData.get("descricaoNbs")),
      codigoServicoMunicipal: parseStr(formData.get("codigoServicoMunicipal")),
      idClienteAsaas: parseStr(formData.get("idClienteAsaas")),
      enviarFaturaLocacao: formData.get("enviarFaturaLocacao") === "on",
      observacoes: parseStr(formData.get("observacoes")),
    },
  });

  revalidatePath("/clientes");
}

export async function setStatus(id: string, status: StatusClienteRecorrente) {
  await prisma.clienteRecorrente.update({ where: { id }, data: { status } });
  revalidatePath("/clientes");
}

export async function deleteCliente(id: string) {
  await prisma.clienteRecorrente.delete({ where: { id } });
  revalidatePath("/clientes");
}

export async function addItemLocado(formData: FormData) {
  const clienteRecorrenteId = String(formData.get("clienteRecorrenteId"));
  const item = parseStr(formData.get("item"));
  const quantidade = parseNum(formData.get("quantidade")) ?? 1;
  const valorUnitario = parseNum(formData.get("valorUnitario")) ?? 0;
  if (!item) throw new Error("Nome do item é obrigatório");

  await prisma.itemLocado.create({
    data: { clienteRecorrenteId, item, quantidade, valorUnitario },
  });

  revalidatePath("/clientes");
}

export async function updateItemLocado(id: string, item: string, quantidade: number, valorUnitario: number) {
  if (!item.trim()) throw new Error("Nome do item é obrigatório");

  await prisma.itemLocado.update({
    where: { id },
    data: { item: item.trim(), quantidade: quantidade || 1, valorUnitario: valorUnitario || 0 },
  });

  revalidatePath("/clientes");
}

export async function deleteItemLocado(id: string) {
  await prisma.itemLocado.delete({ where: { id } });
  revalidatePath("/clientes");
}
