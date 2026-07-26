"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { StatusProposta } from "@/app/generated/prisma/client";
import { salvarArquivo } from "@/app/lib/storage";

export async function createProposta(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const alvo = String(formData.get("alvo") ?? "").trim();
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim() || null;
  const arquivo = formData.get("arquivo") as File | null;

  if (!titulo) throw new Error("Título é obrigatório");

  const [tipoAlvo, idAlvo] = alvo.split(":");
  const leadId = tipoAlvo === "lead" ? idAlvo : null;
  const clienteId = tipoAlvo === "cliente" ? idAlvo : null;

  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : null;

  await prisma.proposta.create({
    data: {
      titulo,
      leadId,
      clienteId,
      valor: valorRaw ? Number(valorRaw) : null,
      conteudo,
      arquivoUrl,
    },
  });

  revalidatePath("/propostas");
}

export async function updatePropostaStatus(id: string, status: StatusProposta) {
  await prisma.proposta.update({ where: { id }, data: { status } });
  revalidatePath("/propostas");
}
