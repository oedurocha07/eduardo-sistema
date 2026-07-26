"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { salvarArquivo } from "@/app/lib/storage";

export async function createDocumento(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const alvo = String(formData.get("alvo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const arquivo = formData.get("arquivo") as File | null;

  if (!nome) throw new Error("Nome é obrigatório");

  const [tipoAlvo, idAlvo] = alvo.split(":");
  const leadId = tipoAlvo === "lead" ? idAlvo : null;
  const clienteId = tipoAlvo === "cliente" ? idAlvo : null;

  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : null;

  await prisma.documento.create({ data: { nome, descricao, leadId, clienteId, arquivoUrl } });

  revalidatePath("/contratos");
}
