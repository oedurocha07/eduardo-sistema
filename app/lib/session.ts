import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/app/lib/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  return prisma.usuario.findUnique({ where: { id: session.userId } });
}
