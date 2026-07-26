import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/app/uploads";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;

  if (nome.includes("..") || nome.includes("/") || nome.includes("\\")) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }

  try {
    const buffer = await readFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, nome));
    const tipo = MIME_TYPES[path.extname(nome).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": tipo, "Content-Disposition": "inline" },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
