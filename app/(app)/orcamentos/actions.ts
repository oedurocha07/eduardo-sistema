"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { salvarArquivo } from "@/app/lib/storage";

export async function createOrcamento(formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "Projeto Personalizado").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const custoRaw = String(formData.get("custoEstimado") ?? "").trim();
  const margemRaw = String(formData.get("margem") ?? "0").trim();
  const arquivo = formData.get("arquivo") as File | null;

  if (!custoRaw) throw new Error("Custo estimado é obrigatório");

  const custo = Number(custoRaw);
  const margem = Number(margemRaw) / 100;
  const preco = custo / (1 - margem || 1);
  const lucro = preco - custo;
  const arquivoUrl = arquivo && arquivo.size > 0 ? await salvarArquivo(arquivo) : null;

  await prisma.orcamento.create({
    data: {
      tipo,
      descricao,
      custoEstimado: custo,
      precoEstimado: preco,
      lucroEstimado: lucro,
      arquivoUrl,
    },
  });

  revalidatePath("/orcamentos");
}
