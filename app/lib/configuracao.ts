import { prisma } from "@/app/lib/prisma";

export async function getConfiguracao() {
  const existente = await prisma.configuracao.findFirst();
  if (existente) return existente;
  return prisma.configuracao.create({ data: {} });
}
