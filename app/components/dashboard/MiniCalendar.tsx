import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { calcularIntervalo, formatarISODate, mesmodia } from "@/app/(app)/agenda/dateUtils";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export async function MiniCalendar() {
  const hoje = new Date();
  const { inicio, fim } = calcularIntervalo("mes", hoje);

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: inicio, lt: fim } },
    select: { data: true },
  });

  const diasComEvento = new Set(eventos.map((e) => formatarISODate(e.data)));

  const dias: Date[] = [];
  for (let d = new Date(inicio); d < fim; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d));
  }

  const mesLabel = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase capitalize">{mesLabel}</h2>
        <Link href="/agenda" className="text-xs text-accent-hover hover:underline">
          Ver agenda
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
        {dias.map((dia) => {
          const isHoje = mesmodia(dia, hoje);
          const doMesAtual = dia.getMonth() === hoje.getMonth();
          const temEvento = diasComEvento.has(formatarISODate(dia));
          return (
            <Link
              key={dia.toISOString()}
              href={`/agenda?view=dia&data=${formatarISODate(dia)}`}
              className="flex flex-col items-center gap-0.5 rounded-md py-1 hover:bg-surface-hover"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isHoje
                    ? "bg-accent font-semibold text-accent-foreground"
                    : doMesAtual
                      ? "text-foreground"
                      : "text-muted/50"
                }`}
              >
                {dia.getDate()}
              </span>
              <span className={`h-1 w-1 rounded-full ${temEvento ? "bg-accent-hover" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
