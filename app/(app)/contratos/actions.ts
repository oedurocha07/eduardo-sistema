"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { salvarArquivo } from "@/app/lib/storage";
import { TipoPessoaCofre } from "@/app/generated/prisma/client";

function parseStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

function lerCamposCofre(formData: FormData) {
  const nomeCompleto = parseStr(formData.get("nomeCompleto"));
  if (!nomeCompleto) throw new Error("Nome completo é obrigatório");

  return {
    tipo: (formData.get("tipo") as TipoPessoaCofre) ?? "JURIDICA",
    nomeCompleto,
    apelido: parseStr(formData.get("apelido")),
    cpfCnpj: parseStr(formData.get("cpfCnpj")),
    responsavel: parseStr(formData.get("responsavel")),
    email: parseStr(formData.get("email")),
    telefone: parseStr(formData.get("telefone")),
    endereco: parseStr(formData.get("endereco")),
    cidade: parseStr(formData.get("cidade")),
    estado: parseStr(formData.get("estado")),
    cep: parseStr(formData.get("cep")),
    observacoes: parseStr(formData.get("observacoes")),
    clienteId: parseStr(formData.get("clienteId")),
  };
}

export async function createCofre(formData: FormData) {
  const campos = lerCamposCofre(formData);
  const cofre = await prisma.cofreCliente.create({ data: campos });

  revalidatePath("/contratos");
  redirect(`/contratos/${cofre.id}`);
}

export async function updateCofre(id: string, formData: FormData) {
  const campos = lerCamposCofre(formData);
  await prisma.cofreCliente.update({ where: { id }, data: campos });

  revalidatePath("/contratos");
  revalidatePath(`/contratos/${id}`);
}

export async function deleteCofre(id: string) {
  await prisma.cofreCliente.delete({ where: { id } });
  revalidatePath("/contratos");
  redirect("/contratos");
}

export async function createDocumentoCofre(cofreId: string, formData: FormData) {
  const nome = parseStr(formData.get("nome"));
  const descricao = parseStr(formData.get("descricao"));
  const arquivo = formData.get("arquivo") as File | null;
  if (!nome) throw new Error("Nome do contrato é obrigatório");

  const cofre = await prisma.cofreCliente.findUnique({ where: { id: cofreId } });
  if (!cofre) throw new Error("Cofre não encontrado");

  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : null;

  await prisma.documento.create({
    data: { nome, descricao, arquivoUrl, cofreClienteId: cofreId, clienteId: cofre.clienteId },
  });

  revalidatePath(`/contratos/${cofreId}`);
}

export async function updateDocumento(id: string, cofreId: string, formData: FormData) {
  const nome = parseStr(formData.get("nome"));
  const descricao = parseStr(formData.get("descricao"));
  const arquivo = formData.get("arquivo") as File | null;
  if (!nome) throw new Error("Nome do contrato é obrigatório");

  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : undefined;

  await prisma.documento.update({
    where: { id },
    data: { nome, descricao, ...(arquivoUrl ? { arquivoUrl } : {}) },
  });

  revalidatePath(`/contratos/${cofreId}`);
}

export async function deleteDocumento(id: string, cofreId: string) {
  await prisma.documento.delete({ where: { id } });
  revalidatePath(`/contratos/${cofreId}`);
}
