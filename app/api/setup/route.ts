import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/auth";

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { email, nome, senha } = await request.json();
  if (!email || !nome || !senha) {
    return Response.json({ error: "email, nome e senha são obrigatórios" }, { status: 400 });
  }

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { senhaHash: hashPassword(senha), nome, papel: "ADMIN" },
    create: { email, nome, senhaHash: hashPassword(senha), papel: "ADMIN" },
  });

  return Response.json({ ok: true, email: usuario.email });
}
