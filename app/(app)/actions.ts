"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { isDashboardModuleKey } from "@/app/lib/dashboardModules";

export async function updateAtalhos(chaves: string[]) {
  const atalhos = chaves.filter(isDashboardModuleKey);
  if (atalhos.length === 0) throw new Error("Selecione ao menos um atalho");

  const existente = await prisma.configuracao.findFirst();
  if (existente) {
    await prisma.configuracao.update({ where: { id: existente.id }, data: { atalhos } });
  } else {
    await prisma.configuracao.create({ data: { atalhos } });
  }

  revalidatePath("/");
}
