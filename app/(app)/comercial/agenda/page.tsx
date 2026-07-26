import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calcularIntervalo, proximoRef, formatarISODate, mesmodia } from "@/app/(app)/agenda/dateUtils";

export const dynamic = "force-dynamic";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function AgendaComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataRaw } = await searchParams;
  const hoje = new Date();
  const ref = dataRaw ? new Date(`${dataRaw}T00:00:00`) : hoje;
  const { inicio, fim } = calcularIntervalo("semana", ref);

  const leads = await prisma.lead.findMany({
    where: {
      etapa: { notIn: ["FECHADO", "PERDIDO"] },
      proximaAcaoEm: { gte: inicio, lt: fim },
    },
    include: { empresa: true, contato: true },
    orderBy: { proximaAcaoEm: "asc" },
  });

  const href = (r: Date) => `/comercial/agenda?data=${formatarISODate(r)}`;
  const fimVisivel = new Date(fim.getTime() - 86400000);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Agenda Comercial"
        subtitle="Próximas ações dos leads distribuídas na semana."
        action={
          <div className="flex items-center gap-1">
            <Link href={href(proximoRef("semana", ref, -1))} className="btn-secondary !p-2">
              <ChevronLeft size={15} />
            </Link>
            <Link href={href(hoje)} className="btn-secondary">
              Hoje
            </Link>
            <Link href={href(proximoRef("semana", ref, 1))} className="btn-secondary !p-2">
              <ChevronRight size={15} />
            </Link>
          </div>
        }
      />

      <p className="mb-4 text-sm text-muted">
        {inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} —{" "}
        {fimVisivel.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {leads.length} ação(ões)
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => {
          const dia = new Date(inicio);
          dia.setDate(dia.getDate() + i);
          const doDia = leads.filter((l) => l.proximaAcaoEm && mesmodia(l.proximaAcaoEm, dia));
          const isHoje = mesmodia(dia, hoje);
          return (
            <div key={i} className="min-h-[140px]">
              <div className="mb-2 text-xs text-muted uppercase">
                {DIAS[dia.getDay()].slice(0, 3)}{" "}
                <span className={`font-semibold ${isHoje ? "text-accent-hover" : "text-foreground"}`}>{dia.getDate()}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {doDia.length === 0 && <p className="text-xs text-muted">—</p>}
                {doDia.map((l) => {
                  const atrasado = l.proximaAcaoEm && l.proximaAcaoEm < hoje;
                  return (
                    <Link
                      key={l.id}
                      href={`/comercial/leads/${l.id}`}
                      className={`rounded-lg border-l-2 bg-surface-hover px-2 py-1.5 text-xs ${atrasado ? "border-danger" : "border-accent"}`}
                    >
                      <div className="truncate font-medium text-foreground">{l.empresa.nome}</div>
                      <div className="truncate text-muted">{l.proximaAcao}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
