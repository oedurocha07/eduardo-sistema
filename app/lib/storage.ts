import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/app/uploads";

export async function salvarArquivo(file: File): Promise<string> {
  await mkdir(/* turbopackIgnore: true */ UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name).slice(0, 10);
  const nomeArquivo = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, nomeArquivo), buffer);
  return `/api/arquivos/${nomeArquivo}`;
}
