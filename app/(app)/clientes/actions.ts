"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { StatusClienteRecorrente } from "@/app/generated/prisma/client";

function parseNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  return s ? Number(s) : null;
}

function parseStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

type ItemLocadoInput = { id?: string; item: string; quantidade: number; valorUnitario: number };

// Só mexe nos itens locados quando o formulário enviou a lista (checkbox "Enviar fatura de
// locação" marcada) — se a checkbox estiver desmarcada os itens salvos ficam intactos, só ocultos.
async function reconciliarItensLocados(clienteRecorrenteId: string, itensJson: string) {
  let itens: ItemLocadoInput[] = [];
  try {
    itens = JSON.parse(itensJson);
  } catch {
    itens = [];
  }
  itens = itens.filter((i) => i.item && i.item.trim());

  const existentes = await prisma.itemLocado.findMany({ where: { clienteRecorrenteId } });
  const idsEnviados = new Set(itens.filter((i) => i.id).map((i) => i.id));
  const paraRemover = existentes.filter((e) => !idsEnviados.has(e.id));

  await prisma.$transaction([
    ...paraRemover.map((e) => prisma.itemLocado.delete({ where: { id: e.id } })),
    ...itens.map((i) =>
      i.id
        ? prisma.itemLocado.update({
            where: { id: i.id },
            data: {
              item: i.item.trim(),
              quantidade: i.quantidade || 1,
              valorUnitario: i.valorUnitario || 0,
            },
          })
        : prisma.itemLocado.create({
            data: {
              clienteRecorrenteId,
              item: i.item.trim(),
              quantidade: i.quantidade || 1,
              valorUnitario: i.valorUnitario || 0,
            },
          })
    ),
  ]);
}

export async function createCliente(formData: FormData) {
  const nome = parseStr(formData.get("nome"));
  if (!nome) throw new Error("Nome é obrigatório");

  const cliente = await prisma.clienteRecorrente.create({
    data: {
      nome,
      cnpjCpf: parseStr(formData.get("cnpjCpf")),
      email: parseStr(formData.get("email")),
      endereco: parseStr(formData.get("endereco")),
      status: (formData.get("status") as StatusClienteRecorrente) ?? "ATIVO",
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

  const itensJson = formData.get("itensLocadosJson");
  if (typeof itensJson === "string") {
    await reconciliarItensLocados(cliente.id, itensJson);
  }

  revalidatePath("/clientes");
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

  const itensJson = formData.get("itensLocadosJson");
  if (typeof itensJson === "string") {
    await reconciliarItensLocados(id, itensJson);
  }

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
