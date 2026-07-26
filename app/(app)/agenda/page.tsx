import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewEventoForm } from "./NewEventoForm";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin, Users } from "lucide-react";
import { AgendaView, calcularIntervalo, proximoRef, formatarISODate, mesmodia } from "./dateUtils";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  REUNIAO: "Reunião",
  GRAVACAO: "Gravação",
  EDICAO: "Edição",
  ENTREGA: "Entrega",
  TAREFA: "Tarefa",
  OUTRO: "Outro",
};

const TIPO_DOT: Record<string, string> = {
  REUNIAO: "bg-blue-400",
  GRAVACAO: "bg-warning",
  EDICAO: "bg-violet-400",
  ENTREGA: "bg-success",
  TAREFA: "bg-accent",
  OUTRO: "bg-neutral-400",
};

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function href(view: AgendaView, ref: Date) {
  return `/agenda?view=${view}&data=${formatarISODate(ref)}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; data?: string }>;
}) {
  const { view: viewRaw, data: dataRaw } = await searchParams;
  const view: AgendaView = viewRaw === "mes" || viewRaw === "dia" ? viewRaw : "semana";
  const hoje = new Date();
  const ref = dataRaw ? new Date(`${dataRaw}T00:00:00`) : hoje;

  const { inicio, fim } = calcularIntervalo(view, ref);

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: inicio, lt: fim } },
    orderBy: { data: "asc" },
  });

  const eventosPorDia = (dia: Date) => eventos.filter((e) => mesmodia(e.data, dia));

  const tituloPeriodo =
    view === "dia"
      ? ref.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
      : view === "mes"
        ? ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : `${inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${new Date(fim.getTime() - 86400000).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Agenda"
        subtitle={`${eventos.length} evento${eventos.length === 1 ? "" : "s"} neste período`}
        action={<NewEventoForm />}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground capitalize">{tituloPeriodo}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {(["mes", "semana", "dia"] as AgendaView[]).map((v) => (
              <Link
                key={v}
                href={href(v, ref)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  view === v ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"
                }`}
              >
                {v}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Link href={href(view, proximoRef(view, ref, -1))} className="btn-secondary !p-2">
              <ChevronLeft size={15} />
            </Link>
            <Link href={href(view, hoje)} className="btn-secondary">
              Hoje
            </Link>
            <Link href={href(view, proximoRef(view, ref, 1))} className="btn-secondary !p-2">
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {eventos.length === 0 && (
        <div className="mb-6">
          <EmptyState icon={CalendarDays} title="Período livre" description="Nenhum evento agendado. Clique em qualquer dia para agendar." />
        </div>
      )}

      {view === "dia" && (
        <div className="flex flex-col gap-2">
          {eventosPorDia(ref).map((e) => (
            <EventoCard key={e.id} evento={e} />
          ))}
        </div>
      )}

      {view === "semana" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => {
            const dia = new Date(inicio);
            dia.setDate(dia.getDate() + i);
            const doDia = eventosPorDia(dia);
            const isHoje = mesmodia(dia, hoje);
            return (
              <div key={i} className="min-h-[140px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted uppercase">
                    {DIAS_SEMANA[dia.getDay()]} <span className={`font-semibold ${isHoje ? "text-accent-hover" : "text-foreground"}`}>{dia.getDate()}</span>
                  </span>
                  <NewEventoForm
                    defaultData={`${formatarISODate(dia)}T09:00`}
                    trigger={
                      <button className="text-muted hover:text-accent-hover">
                        <Plus size={13} />
                      </button>
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  {doDia.length === 0 && <p className="text-xs text-muted">—</p>}
                  {doDia.map((e) => (
                    <div key={e.id} className="rounded-lg bg-surface-hover px-2 py-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIPO_DOT[e.tipo]}`} />
                        <span className="truncate text-foreground">{e.titulo}</span>
                      </div>
                      <span className="text-muted">{e.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "mes" && (
        <div className="grid grid-cols-7 gap-2">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-xs text-muted uppercase">
              {d}
            </div>
          ))}
          {Array.from({ length: Math.round((fim.getTime() - inicio.getTime()) / 86400000) }).map((_, i) => {
            const dia = new Date(inicio);
            dia.setDate(dia.getDate() + i);
            const doDia = eventosPorDia(dia);
            const isHoje = mesmodia(dia, hoje);
            const foraDoMes = dia.getMonth() !== ref.getMonth();
            return (
              <Link
                key={i}
                href={href("dia", dia)}
                className={`card flex min-h-[90px] flex-col gap-1 p-2 transition-colors hover:border-accent/50 ${foraDoMes ? "opacity-40" : ""}`}
              >
                <span className={`text-xs font-medium ${isHoje ? "text-accent-hover" : "text-foreground"}`}>{dia.getDate()}</span>
                <div className="flex flex-col gap-0.5">
                  {doDia.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-center gap-1 truncate text-[11px] text-muted">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIPO_DOT[e.tipo]}`} />
                      <span className="truncate">{e.titulo}</span>
                    </div>
                  ))}
                  {doDia.length > 3 && <span className="text-[11px] text-muted">+{doDia.length - 3}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventoCard({
  evento,
}: {
  evento: { id: string; titulo: string; tipo: string; data: Date; dataFim: Date | null; local: string | null; participantes: string | null; descricao: string | null };
}) {
  return (
    <div className="card">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${TIPO_DOT[evento.tipo]}`} />
          <span className="font-medium text-foreground">{evento.titulo}</span>
        </div>
        <span className="text-xs text-muted">
          {evento.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          {evento.dataFim && ` — ${evento.dataFim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="rounded-full bg-surface-hover px-2 py-0.5">{TIPO_LABEL[evento.tipo]}</span>
        {evento.local && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {evento.local}
          </span>
        )}
        {evento.participantes && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {evento.participantes}
          </span>
        )}
      </div>
      {evento.descricao && <p className="mt-2 text-sm text-muted">{evento.descricao}</p>}
    </div>
  );
}
