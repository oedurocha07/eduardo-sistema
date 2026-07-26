import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Badge } from "@/app/components/ui/Badge";
import { NewEventoProducaoForm } from "./NewEventoProducaoForm";
import { STATUS_EVENTO } from "./constants";
import { CalendarRange, Radio, Users, MapPin, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const [eventos, clientes] = await Promise.all([
    prisma.eventoProducao.findMany({
      include: {
        cliente: { include: { empresa: true } },
        _count: { select: { ambientes: true, equipe: true } },
      },
      orderBy: { dataInicio: "desc" },
    }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const aoVivo = eventos.filter((e) => e.status === "AO_VIVO").length;
  const proximos = eventos.filter((e) => e.status !== "ENCERRADO" && e.dataInicio >= new Date()).length;
  const totalEquipe = eventos.reduce((s, e) => s + e._count.equipe, 0);

  function statusInfo(status: string) {
    return STATUS_EVENTO.find((s) => s.value === status) ?? STATUS_EVENTO[0];
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Eventos"
        title="Operação de Eventos"
        subtitle="Planeje a equipe, prepare cada detalhe e comande o evento em tempo real — sem espalhar a operação entre planilhas e grupos."
        action={<NewEventoProducaoForm clientes={clientes.map((c) => ({ id: c.id, nome: c.empresa.nome }))} />}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Ao vivo agora" value={aoVivo} icon={Radio} tone={aoVivo > 0 ? "danger" : "default"} />
        <StatCard label="Próximos eventos" value={proximos} icon={CalendarRange} />
        <StatCard label="Equipe alocada" value={totalEquipe} icon={Users} />
      </div>

      {eventos.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Nenhum evento ainda"
          description="Crie seu primeiro evento para montar cronograma, equipe, equipamentos e checklists."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {eventos.map((e) => {
            const info = statusInfo(e.status);
            return (
              <Link
                key={e.id}
                href={`/eventos/${e.id}`}
                className="card group flex flex-col gap-3 transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{e.nome}</div>
                    {e.cliente && <div className="text-sm text-muted">{e.cliente.empresa.nome}</div>}
                  </div>
                  <Badge tone={info.tone}>{info.label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarRange size={14} />
                    {e.dataInicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                  </span>
                  {e.local && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {e.local}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                  <span>
                    {e._count.ambientes} ambiente(s) · {e._count.equipe} na equipe
                  </span>
                  <ArrowRight size={15} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
