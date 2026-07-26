"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { PapelUsuario } from "@/app/generated/prisma/client";

export async function updateNome(formData: FormData) {
  const usuarioId = String(formData.get("usuarioId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim() || null;
  if (!usuarioId || !nome) throw new Error("Nome é obrigatório");

  await prisma.usuario.update({ where: { id: usuarioId }, data: { nome, cargo } });
  revalidatePath("/configuracoes");
}

export async function createMembro(
  formData: FormData
): Promise<{ email: string; senha: string }> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const papel = String(formData.get("papel") ?? "MEMBRO") as PapelUsuario;

  if (!nome || !email) throw new Error("Nome e e-mail são obrigatórios");

  const senha = randomBytes(9).toString("base64url");

  await prisma.usuario.create({
    data: { nome, email, papel, senhaHash: hashPassword(senha) },
  });

  revalidatePath("/configuracoes");
  return { email, senha };
}

export async function updateMetas(formData: FormData) {
  const metaMensalRaw = String(formData.get("metaMensal") ?? "").trim();
  const superMetaMensalRaw = String(formData.get("superMetaMensal") ?? "").trim();

  const existente = await prisma.configuracao.findFirst();
  const data = {
    metaMensal: metaMensalRaw ? Number(metaMensalRaw) : null,
    superMetaMensal: superMetaMensalRaw ? Number(superMetaMensalRaw) : null,
  };

  if (existente) {
    await prisma.configuracao.update({ where: { id: existente.id }, data });
  } else {
    await prisma.configuracao.create({ data });
  }

  revalidatePath("/configuracoes");
  revalidatePath("/");
}

export async function updateSenha(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = String(formData.get("usuarioId") ?? "");
  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (novaSenha.length < 8) return { ok: false, error: "A nova senha precisa ter pelo menos 8 caracteres" };
  if (novaSenha !== confirmarSenha) return { ok: false, error: "As senhas não coincidem" };

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario || !verifyPassword(senhaAtual, usuario.senhaHash)) {
    return { ok: false, error: "Senha atual incorreta" };
  }

  await prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash: hashPassword(novaSenha) } });
  return { ok: true };
}

export async function updateCorDestaque(corDestaque: string) {
  const existente = await prisma.configuracao.findFirst();
  if (existente) {
    await prisma.configuracao.update({ where: { id: existente.id }, data: { corDestaque } });
  } else {
    await prisma.configuracao.create({ data: { corDestaque } });
  }

  revalidatePath("/", "layout");
}
