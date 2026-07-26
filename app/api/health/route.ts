import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "connected" });
  } catch (error) {
    return Response.json(
      { status: "error", db: "disconnected", message: String(error) },
      { status: 503 }
    );
  }
}
