"use server";

import { prisma } from "@/app/lib/prisma";
import { hashPassword, hashTokenReset } from "@/app/lib/auth";

export async function redefinirSenha(token: string, novaSenha: string) {
  if (novaSenha.length < 8) {
    return { ok: false, error: "A senha precisa ter pelo menos 8 caracteres" };
  }

  const hash = hashTokenReset(token);
  const usuario = await prisma.usuario.findFirst({ where: { resetTokenHash: hash } });

  if (!usuario || !usuario.resetTokenExp || usuario.resetTokenExp < new Date()) {
    return { ok: false, error: "Link inválido ou expirado. Solicite um novo." };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash: hashPassword(novaSenha), resetTokenHash: null, resetTokenExp: null },
  });

  return { ok: true };
}
