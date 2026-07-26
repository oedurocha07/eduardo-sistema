"use server";

import { prisma } from "@/app/lib/prisma";
import { gerarTokenReset } from "@/app/lib/auth";
import { enviarEmailResetSenha } from "@/app/lib/n8n";

export async function solicitarReset(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (usuario) {
    const { token, hash } = gerarTokenReset();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetTokenHash: hash, resetTokenExp },
    });

    const appUrl = process.env.APP_URL ?? "https://system.oedurocha.com.br";
    const link = `${appUrl}/redefinir-senha?token=${token}`;

    await enviarEmailResetSenha({ email: usuario.email, nome: usuario.nome, link });
  }

  // Resposta genérica sempre — não revela se o e-mail existe ou não.
  return { ok: true };
}
