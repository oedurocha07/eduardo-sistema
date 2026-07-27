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
      valorTrabalho: parseNum(formData.get("valorTrabalho")),
      formaPagamento: parseStr(formData.get("formaPagamento")),
      descricaoServico: parseStr(formData.get("descricaoServico")),
      descricaoNbs: parseStr(formData.get("descricaoNbs")),
      codigoServicoMunicipal: parseStr(formData.get("codigoServicoMunicipal")),
      enviarFaturaLocacao: formData.get("enviarFaturaLocacao") === "on",
      observacoes: parseStr(formData.get("observacoes")),
    },
  });

  const itensRaw = parseStr(formData.get("itensLocadosJson"));
  if (itensRaw) {
    try {
      const itens = JSON.parse(itensRaw) as { item: string; quantidade: string; valorUnitario: string }[];
      const validos = itens.filter((i) => i.item?.trim());
      if (validos.length > 0) {
        await prisma.itemLocado.createMany({
          data: validos.map((i) => ({
            clienteRecorrenteId: cliente.id,
            item: i.item.trim(),
            quantidade: Number(i.quantidade) || 1,
            valorUnitario: Number(i.valorUnitario) || 0,
          })),
        });
      }
    } catch (e) {
      console.error("Erro ao processar itens locados:", e);
    }
  }

  const criado = await criarClienteAsaas({ nome, cnpjCpf, email });
  if (criado) {
    await prisma.clienteRecorrente.update({ where: { id: cliente.id }, data: { idClienteAsaas: criado.id } });
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
      valorTrabalho: parseNum(formData.get("valorTrabalho")),
      formaPagamento: parseStr(formData.get("formaPagamento")),
      descricaoServico: parseStr(formData.get("descricaoServico")),
      descricaoNbs: parseStr(formData.get("descricaoNbs")),
      codigoServicoMunicipal: parseStr(formData.get("codigoServicoMunicipal")),
      // idClienteAsaas não é editável no formulário — é gerenciado automaticamente.
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
  const cliente = await prisma.clienteRecorrente.findUnique({
    where: { id },
    include: { _count: { select: { lancamentos: true, propostas: true, orcamentos: true } } },
  });
  if (!cliente) return;

  const total = Object.values(cliente._count).reduce((s, n) => s + n, 0);
  if (total > 0) {
    throw new Error(
      "Não é possível excluir: esse cliente tem lançamentos financeiros, propostas ou orçamentos vinculados.",
    );
  }

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
