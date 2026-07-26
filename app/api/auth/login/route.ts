import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return Response.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !verifyPassword(senha, usuario.senhaHash)) {
    return Response.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
  }

  const token = createSessionToken(usuario.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return Response.json({ ok: true });
}
