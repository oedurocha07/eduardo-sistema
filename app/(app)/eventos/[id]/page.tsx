import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EventoSectionNav } from "./EventoSectionNav";
import { EventoStatusSelect } from "./EventoStatusSelect";
import { EventoDeleteButton } from "./EventoDeleteButton";
import { EventoTimeline } from "./EventoTimeline";
import { ChecklistSection } from "./ChecklistSection";
import { EquipeSection } from "./EquipeSection";
import { EquipamentosSection } from "./EquipamentosSection";
import { CustosSection } from "./CustosSection";
import { ReferenciasSection } from "./ReferenciasSection";
import {
  ArrowLeft,
  MapPin,
  CalendarRange,
  Radio,
  Users,
  LayoutGrid,
  ClipboardCheck,
  Package,
  Wallet,
  Bookmark,
} from "lucide-react";

export const dynamic = "force-dynamic";

function isoLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const evento = await prisma.eventoProducao.findUnique({
    where: { id },
    include: {
      cliente: { include: { empresa: true } },
      ambientes: { include: { blocos: { orderBy: { inicio: "asc" } } }, orderBy: { ordem: "asc" } },
      equipe: { orderBy: { funcao: "asc" } },
      equipamentos: { orderBy: { nome: "asc" } },
      checklist: { orderBy: { titulo: "asc" } },
      custos: { orderBy: { valor: "desc" } },
      referencias: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!evento) notFound();

  const now = new Date();

  // Range da timeline
  const todosBlocos = evento.ambientes.flatMap((a) => a.blocos);
  let rangeStart: Date;
  let rangeEnd: Date;
  if (todosBlocos.length > 0) {
    rangeStart = new Date(Math.min(...todosBlocos.map((b) => b.inicio.getTime())));
    rangeEnd = new Date(Math.max(...todosBlocos.map((b) => b.fim.getTime())));
    rangeStart.setMinutes(0, 0, 0);
    rangeEnd.setMinutes(0, 0, 0);
    rangeEnd = new Date(rangeEnd.getTime() + 3600000);
  } else {
    rangeStart = new Date(evento.dataInicio);
    rangeStart.setHours(8, 0, 0, 0);
    rangeEnd = new Date(evento.dataInicio);
    rangeEnd.setHours(20, 0, 0, 0);
  }

  const ambientesTimeline = evento.ambientes.map((a) => ({
    id: a.id,
    nome: a.nome,
    cor: a.cor ?? "#ebbb1c",
    blocos: a.blocos.map((b) => ({
      id: b.id,
      titulo: b.titulo,
      inicioMs: b.inicio.getTime(),
      fimMs: b.fim.getTime(),
      responsavel: b.responsavel,
    })),
  }));

  // Modo ao vivo: bloco atual por ambiente
  const agora = evento.ambientes.map((a) => {
    const atual = a.blocos.find((b) => b.inicio <= now && now <= b.fim);
    const proximo = a.blocos.find((b) => b.inicio > now);
    return { ambiente: a, atual, proximo };
  });

  const checklistTotal = evento.checklist.length;
  const checklistFeitos = evento.checklist.filter((c) => c.concluido).length;
  const preparacaoPct = checklistTotal > 0 ? Math.round((checklistFeitos / checklistTotal) * 100) : 0;

  const dataBaseISO = isoLocalDate(evento.dataInicio);

  const visaoGeral = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <Users size={18} className="mx-auto mb-1 text-muted" />
          <div className="text-2xl font-bold text-foreground">{evento.equipe.length}</div>
          <div className="text-xs text-muted uppercase">Equipe</div>
        </div>
        <div className="card text-center">
          <LayoutGrid size={18} className="mx-auto mb-1 text-muted" />
          <div className="text-2xl font-bold text-foreground">{evento.ambientes.length}</div>
          <div className="text-xs text-muted uppercase">Ambientes</div>
        </div>
        <div className="card text-center">
          <ClipboardCheck size={18} className="mx-auto mb-1 text-muted" />
          <div className="text-2xl font-bold text-foreground">{preparacaoPct}%</div>
          <div className="text-xs text-muted uppercase">Preparação</div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Radio size={16} className={evento.status === "AO_VIVO" ? "text-danger" : "text-muted"} />
          Modo ao vivo
        </h2>
        {agora.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
            Adicione ambientes e blocos no Cronograma para acompanhar a operação ao vivo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agora.map(({ ambiente, atual, proximo }) => (
              <div key={ambiente.id} className="card">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ambiente.cor ?? "#ebbb1c" }} />
                  <span className="text-xs font-semibold text-muted uppercase">{ambiente.nome}</span>
                </div>
                {atual ? (
                  <>
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">AGORA</span>
                    </div>
                    <div className="font-medium text-foreground">{atual.titulo}</div>
                    <div className="text-xs text-muted">
                      {atual.inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} —{" "}
                      {atual.fim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                    </div>
                  </>
                ) : proximo ? (
                  <>
                    <div className="text-xs text-muted uppercase">A seguir</div>
                    <div className="font-medium text-foreground">{proximo.titulo}</div>
                    <div className="text-xs text-muted">
                      {proximo.inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted">Sem blocos agendados.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const secoesNav = [
    { id: "visao", label: "Visão geral" },
    { id: "cronograma", label: "Cronograma" },
    { id: "equipe", label: `Equipe (${evento.equipe.length})` },
    { id: "equipamentos", label: "Equipamentos" },
    { id: "checklist", label: "Checklists" },
    { id: "custos", label: "Custos" },
    { id: "referencias", label: "Referências" },
  ];

  return (
    <div className="p-6 md:p-8">
      <Link href="/eventos" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para Eventos
      </Link>

      <PageHeader
        title={evento.nome}
        subtitle={evento.cliente ? evento.cliente.empresa.nome : undefined}
        action={
          <div className="flex items-center gap-2">
            <EventoStatusSelect id={evento.id} status={evento.status} />
            <EventoDeleteButton id={evento.id} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <CalendarRange size={14} />
          {evento.dataInicio.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })}
          {evento.dataFim && ` — ${evento.dataFim.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })}`}
        </span>
        {evento.local && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {evento.local}
          </span>
        )}
      </div>

      <EventoSectionNav secoes={secoesNav} />

      <div className="flex flex-col gap-10">
        <section id="visao" className="scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <LayoutGrid size={16} className="text-accent" /> Visão geral
          </h2>
          {visaoGeral}
        </section>

        <section id="cronograma" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <CalendarRange size={16} className="text-accent" /> Cronograma
          </h2>
          <EventoTimeline
            eventoId={evento.id}
            ambientes={ambientesTimeline}
            rangeStartMs={rangeStart.getTime()}
            rangeEndMs={rangeEnd.getTime()}
            dataBaseISO={dataBaseISO}
          />
        </section>

        <section id="equipe" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Users size={16} className="text-accent" /> Equipe ({evento.equipe.length})
          </h2>
          <EquipeSection
            eventoId={evento.id}
            membros={evento.equipe.map((m) => ({
              id: m.id,
              nome: m.nome,
              funcao: m.funcao,
              diaISO: m.dia ? m.dia.toISOString() : null,
              cache: m.cache ? Number(m.cache) : null,
              contato: m.contato,
            }))}
          />
        </section>

        <section id="equipamentos" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Package size={16} className="text-accent" /> Equipamentos
          </h2>
          <EquipamentosSection
            eventoId={evento.id}
            equipamentos={evento.equipamentos.map((e) => ({
              id: e.id,
              nome: e.nome,
              responsavel: e.responsavel,
              status: e.status,
              quantidade: e.quantidade,
            }))}
          />
        </section>

        <section id="checklist" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <ClipboardCheck size={16} className="text-accent" /> Checklists
          </h2>
          <ChecklistSection
            eventoId={evento.id}
            itens={evento.checklist.map((c) => ({ id: c.id, titulo: c.titulo, fase: c.fase, concluido: c.concluido }))}
          />
        </section>

        <section id="custos" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Wallet size={16} className="text-accent" /> Custos
          </h2>
          <CustosSection
            eventoId={evento.id}
            custos={evento.custos.map((c) => ({ id: c.id, descricao: c.descricao, tipo: c.tipo, valor: Number(c.valor) }))}
          />
        </section>

        <section id="referencias" className="card scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Bookmark size={16} className="text-accent" /> Referências
          </h2>
          <ReferenciasSection
            eventoId={evento.id}
            referencias={evento.referencias.map((r) => ({ id: r.id, titulo: r.titulo, url: r.url, arquivoUrl: r.arquivoUrl }))}
          />
        </section>
      </div>
    </div>
  );
}
