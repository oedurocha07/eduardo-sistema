"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePropostaPagoManual(propostaId: string, pago: boolean) {
  await prisma.proposta.update({
    where: { id: propostaId },
    data: { pagoManual: pago },
  });
  revalidatePath("/");
}
