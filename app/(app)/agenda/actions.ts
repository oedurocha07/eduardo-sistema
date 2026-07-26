"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { TipoEvento } from "@/app/generated/prisma/client";

export async function createEvento(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "OUTRO") as TipoEvento;
  const dataRaw = String(formData.get("data") ?? "").trim();
  const dataFimRaw = String(formData.get("dataFim") ?? "").trim();
  const local = String(formData.get("local") ?? "").trim() || null;
  const participantes = String(formData.get("participantes") ?? "").trim() || null;
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!titulo || !dataRaw) throw new Error("Título e data são obrigatórios");

  await prisma.evento.create({
    data: {
      titulo,
      tipo,
      data: new Date(dataRaw),
      dataFim: dataFimRaw ? new Date(dataFimRaw) : null,
      local,
      participantes,
      descricao,
    },
  });

  revalidatePath("/agenda");
}
