import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PropostaStatusSelect } from "@/app/(app)/propostas/PropostaStatusSelect";
import { ETAPAS } from "@/app/(app)/comercial/constants";
import { ETAPAS_PRODUCAO } from "@/app/(app)/projetos/constants";
import { EtapaStepper } from "./EtapaStepper";
import { TemperaturaToggle } from "./TemperaturaToggle";
import { ProximaAcaoForm } from "./ProximaAcaoForm";
import { DetalhesForm } from "./DetalhesForm";
import { LeadTabs } from "./LeadTabs";
import { QuickStatusButtons } from "./QuickStatusButtons";
import { TimelineSection } from "./TimelineSection";
import { DeleteLeadButton } from "./DeleteLeadButton";
import { ArrowLeft, FileText, Shield, FolderKanban, Wallet, Users, Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lead, usuarios] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        empresa: true,
        contato: true,
        responsavel: true,
        propostas: { orderBy: { createdAt: "desc" } },
        documentos: { orderBy: { createdAt: "desc" } },
        atividades: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.usuario.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!lead) notFound();

  const [contatosEmpresa, cliente] = await Promise.all([
    prisma.contato.findMany({ where: { empresaId: lead.empresaId }, orderBy: { createdAt: "asc" } }),
    prisma.cliente.findUnique({
      where: { empresaId: lead.empresaId },
      include: {
        projetos: { orderBy: { createdAt: "desc" } },
        lancamentos: { orderBy: { vencimento: "desc" }, take: 10 },
      },
    }),
  ]);

  const etapaInfo = ETAPAS.find((et) => et.value === lead.etapa);

  const abas = [
    {
      id: "informacoes",
      label: "Informações",
      content: (
        <div className="flex flex-col gap-6">
          <ProximaAcaoForm leadId={lead.id} proximaAcao={lead.proximaAcao} proximaAcaoEm={lead.proximaAcaoEm} />
          <div>
            <h3 className="mb-2 text-xs font-semibold text-muted uppercase">Detalhes do lead</h3>
            <DetalhesForm
              leadId={lead.id}
              empresaNome={lead.empresa.nome}
              valorEstimado={lead.valorEstimado?.toString() ?? null}
              origem={lead.origem}
              responsavelId={lead.responsavelId}
              usuarios={usuarios.map((u) => ({ id: u.id, nome: u.nome }))}
            />
          </div>
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      content: (
        <TimelineSection
          leadId={lead.id}
          atividades={lead.atividades.map((a) => ({
            id: a.id,
            tipo: a.tipo,
            descricao: a.descricao,
            autor: a.autor,
            createdAtISO: a.createdAt.toISOString(),
          }))}
        />
      ),
    },
    {
      id: "contatos",
      label: `Contatos (${contatosEmpresa.length})`,
      content:
        contatosEmpresa.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum contato cadastrado" />
        ) : (
          <div className="flex flex-col gap-2">
            {contatosEmpresa.map((c) => (
              <div key={c.id} className="card">
                <div className="font-medium text-foreground">{c.nome}</div>
                <div className="text-sm text-muted">
                  {c.cargo && <>{c.cargo} · </>}
                  {c.email ?? "—"} {c.telefone && <>· {c.telefone}</>}
                </div>
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "propostas",
      label: "Propostas",
      content:
        lead.propostas.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhuma proposta vinculada" />
        ) : (
          <div className="flex flex-col gap-2">
            {lead.propostas.map((p) => (
              <div key={p.id} className="card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    {p.titulo}
                    {p.arquivoUrl && (
                      <a href={p.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent-hover">
                        <Paperclip size={14} />
                      </a>
                    )}
                  </div>
                  {p.valor && (
                    <div className="text-sm text-muted">
                      <Money value={Number(p.valor)} />
                    </div>
                  )}
                </div>
                <PropostaStatusSelect id={p.id} status={p.status} />
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "contratos",
      label: "Contratos",
      content:
        lead.documentos.length === 0 ? (
          <EmptyState icon={Shield} title="Nenhum contrato vinculado" />
        ) : (
          <div className="flex flex-col gap-2">
            {lead.documentos.map((doc) => (
              <div key={doc.id} className="card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    {doc.nome}
                    {doc.arquivoUrl && (
                      <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent-hover">
                        <Paperclip size={14} />
                      </a>
                    )}
                  </div>
                  {doc.descricao && <div className="text-sm text-muted">{doc.descricao}</div>}
                </div>
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "projetos",
      label: "Projetos",
      content: !cliente ? (
        <EmptyState icon={FolderKanban} title="Lead ainda não virou cliente" description="Marque como fechado para liberar projetos." />
      ) : cliente.projetos.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Nenhum projeto ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {cliente.projetos.map((proj) => (
            <Link key={proj.id} href={`/projetos/${cliente.id}`} className="card flex items-center justify-between hover:border-accent/50">
              <span className="font-medium text-foreground">{proj.nome}</span>
              <Badge tone={proj.status === "CONCLUIDA" ? "success" : "neutral"}>
                {ETAPAS_PRODUCAO.find((et) => et.value === proj.status)?.label ?? proj.status}
              </Badge>
            </Link>
          ))}
        </div>
      ),
    },
    {
      id: "financeiro",
      label: "Financeiro",
      content: !cliente ? (
        <EmptyState icon={Wallet} title="Lead ainda não virou cliente" description="Marque como fechado para liberar o financeiro." />
      ) : cliente.lancamentos.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhum lançamento ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {cliente.lancamentos.map((l) => (
            <div key={l.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{l.descricao}</div>
                <div className="text-xs text-muted">
                  {l.vencimento.toLocaleDateString("pt-BR", { timeZone: "UTC" })} · {l.status}
                </div>
              </div>
              <Money value={Number(l.valor)} className={l.tipo === "RECEITA" ? "text-success" : "text-danger"} />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <Link href="/comercial" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para o Comercial
      </Link>

      <PageHeader
        eyebrow={etapaInfo?.label}
        title={lead.empresa.nome}
        subtitle={`${lead.contato.nome}${lead.origem ? ` · ${lead.origem}` : ""}`}
        action={
          <>
            <div className="text-right">
              <div className="text-xs text-muted uppercase">Valor estimado</div>
              <div className="text-xl font-bold text-foreground">
                <Money value={Number(lead.valorEstimado ?? 0)} />
              </div>
            </div>
            <DeleteLeadButton id={lead.id} empresaNome={lead.empresa.nome} />
          </>
        }
      />

      <div className="card mb-6">
        <EtapaStepper leadId={lead.id} etapa={lead.etapa} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <TemperaturaToggle leadId={lead.id} temperatura={lead.temperatura} />
        <QuickStatusButtons leadId={lead.id} etapa={lead.etapa} />
      </div>

      <div className="card">
        <LeadTabs abas={abas} />
      </div>
    </div>
  );
}
