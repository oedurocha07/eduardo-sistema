import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { TarefasList } from "../TarefasList";
import { FluxoProducaoStepper } from "./FluxoProducaoStepper";
import { EntregaveisSection } from "./EntregaveisSection";
import { MarcosSection } from "./MarcosSection";
import { EquipeProjetoSection } from "./EquipeProjetoSection";
import { DetalhesProjetoForm } from "./DetalhesProjetoForm";
import { ArquivarProjetoButton } from "./ArquivarProjetoButton";
import { DeleteProjetoButton } from "./DeleteProjetoButton";
import { ETAPAS_PRODUCAO } from "../../constants";
import { ArrowLeft, CalendarClock, Wallet, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ clienteId: string; projetoId: string }>;
}) {
  const { clienteId, projetoId } = await params;

  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      cliente: { include: { empresa: true } },
      tarefas: { orderBy: { createdAt: "asc" } },
      entregaveis: { orderBy: { createdAt: "asc" } },
      marcos: { orderBy: { data: "asc" } },
      equipe: true,
    },
  });

  if (!projeto || projeto.clienteId !== clienteId) notFound();

  const indiceAtual = ETAPAS_PRODUCAO.findIndex((e) => e.value === projeto.status);
  const progresso = Math.round((indiceAtual / (ETAPAS_PRODUCAO.length - 1)) * 100);

  return (
    <div className="p-6 md:p-8">
      <Link
        href={`/projetos/${clienteId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Voltar para {projeto.cliente.empresa.nome}
      </Link>

      <PageHeader
        eyebrow={projeto.cliente.empresa.nome}
        title={projeto.nome}
        action={
          <div className="flex items-center gap-2">
            {projeto.arquivado && <Badge tone="neutral">Arquivado</Badge>}
            <ArquivarProjetoButton id={projeto.id} clienteId={clienteId} arquivado={projeto.arquivado} />
            <DeleteProjetoButton id={projeto.id} clienteId={clienteId} nome={projeto.nome} />
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-1.5 text-xs text-muted uppercase">
            <TrendingUp size={12} /> Progresso geral
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{progresso}%</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-1.5 text-xs text-muted uppercase">
            <CalendarClock size={12} /> Prazo geral
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">
            {projeto.dataEntrega ? projeto.dataEntrega.toLocaleDateString("pt-BR") : "—"}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-1.5 text-xs text-muted uppercase">
            <Wallet size={12} /> Valor
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">
            <Money value={projeto.valor ? Number(projeto.valor) : 0} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-1.5 text-xs text-muted uppercase">
            <Users size={12} /> Equipe
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{projeto.equipe.length}</div>
        </div>
      </div>

      <div className="mb-6">
        <FluxoProducaoStepper projetoId={projeto.id} status={projeto.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <EntregaveisSection projetoId={projeto.id} clienteId={clienteId} itens={projeto.entregaveis} />
          <MarcosSection projetoId={projeto.id} clienteId={clienteId} itens={projeto.marcos} />
          <div className="card">
            <h2 className="mb-3 font-semibold text-foreground">Tarefas internas</h2>
            <TarefasList projetoId={projeto.id} tarefas={projeto.tarefas} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <DetalhesProjetoForm
            projetoId={projeto.id}
            clienteId={clienteId}
            valor={projeto.valor ? Number(projeto.valor) : null}
            dataEntrega={projeto.dataEntrega}
            briefing={projeto.briefing}
            areaClienteNotas={projeto.areaClienteNotas}
          />
          <EquipeProjetoSection
            projetoId={projeto.id}
            clienteId={clienteId}
            membros={projeto.equipe.map((m) => ({
              id: m.id,
              nome: m.nome,
              funcao: m.funcao,
              cache: m.cache ? Number(m.cache) : null,
              contato: m.contato,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
