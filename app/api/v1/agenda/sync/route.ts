import { prisma } from "@/app/lib/prisma";
import { parseDataHoraLocal } from "@/app/lib/parseDataHoraLocal";
import { revalidatePath } from "next/cache";
import { TipoEvento } from "@/app/generated/prisma/client";

type EventoNotionPayload = {
  notionPageId: string;
  titulo: string;
  categoria?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  descricao?: string | null;
};

const CATEGORIA_PARA_TIPO: Record<string, TipoEvento> = {
  "Reunião": "REUNIAO",
  "Filmagem": "GRAVACAO",
  "Trabalho": "TAREFA",
  "Pagamento": "TAREFA",
  "Conteúdos": "EDICAO",
};

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.AGENDA_SYNC_API_KEY) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: { eventos: EventoNotionPayload[] } = await request.json();
  const eventos = Array.isArray(body.eventos) ? body.eventos : [];

  for (const evento of eventos) {
    if (!evento.notionPageId || !evento.titulo || !evento.dataInicio) continue;

    const tipo = (evento.categoria && CATEGORIA_PARA_TIPO[evento.categoria]) || "OUTRO";

    await prisma.evento.upsert({
      where: { notionPageId: evento.notionPageId },
      create: {
        notionPageId: evento.notionPageId,
        titulo: evento.titulo,
        tipo,
        data: parseDataHoraLocal(evento.dataInicio),
        dataFim: evento.dataFim ? parseDataHoraLocal(evento.dataFim) : null,
        descricao: evento.descricao ?? null,
      },
      update: {
        titulo: evento.titulo,
        tipo,
        data: parseDataHoraLocal(evento.dataInicio),
        dataFim: evento.dataFim ? parseDataHoraLocal(evento.dataFim) : null,
        descricao: evento.descricao ?? null,
      },
    });
  }

  const idsAtuais = eventos.map((e) => e.notionPageId).filter(Boolean);
  const removidos = await prisma.evento.deleteMany({
    where: {
      notionPageId: { not: null, notIn: idsAtuais },
    },
  });

  revalidatePath("/agenda");

  return Response.json({ ok: true, sincronizados: eventos.length, removidos: removidos.count });
}
