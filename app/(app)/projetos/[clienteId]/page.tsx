import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Badge } from "@/app/components/ui/Badge";
import { Money } from "@/app/components/ui/Money";
import { NewProjetoForm } from "../NewProjetoForm";
import { ProjetoStatusSelect } from "../ProjetoStatusSelect";
import { TarefasList } from "./TarefasList";
import { ArrowLeft, ArrowRight, FolderKanban, FileText, Shield, Wallet, Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClienteWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ clienteId: string }>;
  searchParams: Promise<{ arquivados?: string }>;
}) {
  const { clienteId } = await params;
  const { arquivados } = await searchParams;
  const mostrarArquivados = arquivados === "1";

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      empresa: true,
      projetos: {
        where: { arquivado: mostrarArquivados },
        include: { tarefas: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      lancamentos: { orderBy: { vencimento: "desc" }, take: 10 },
      documentos: { orderBy: { createdAt: "desc" } },
      propostas: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cliente) notFound();

  const totalProjetosAtivos = await prisma.projeto.count({ where: { clienteId, arquivado: false } });
  const tarefasAbertas = cliente.projetos.flatMap((p) => p.tarefas).filter((t) => !t.concluida).length;

  return (
    <div className="p-6 md:p-8">
      <Link href="/projetos" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para Clientes
      </Link>

      <PageHeader
        title={cliente.empresa.nome}
        subtitle={`${totalProjetosAtivos} projeto(s) ativo(s) · ${tarefasAbertas} tarefa(s) abertas`}
        action={<NewProjetoForm clientes={[{ id: cliente.id, nome: cliente.empresa.nome }]} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Produções</h2>
            <Link
              href={mostrarArquivados ? `/projetos/${clienteId}` : `/projetos/${clienteId}?arquivados=1`}
              className="text-xs text-accent-hover hover:underline"
            >
              {mostrarArquivados ? "Ver ativos" : "Ver arquivados"}
            </Link>
          </div>
          {cliente.projetos.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={mostrarArquivados ? "Nenhum projeto arquivado" : "Nenhum projeto ainda"}
              description={mostrarArquivados ? undefined : "Crie o primeiro projeto para este cliente."}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {cliente.projetos.map((p) => (
                <div key={p.id} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/projetos/${clienteId}/${p.id}`}
                      className="group flex items-center gap-1.5 font-medium text-foreground hover:text-accent-hover"
                    >
                      {p.nome}
                      {p.arquivado && <Badge tone="neutral">Arquivado</Badge>}
                      <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <ProjetoStatusSelect id={p.id} status={p.status} />
                  </div>
                  <TarefasList projetoId={p.id} tarefas={p.tarefas} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <Wallet size={14} /> Financeiro
            </h2>
            {cliente.lancamentos.length === 0 ? (
              <p className="text-sm text-muted">Nenhum lançamento ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cliente.lancamentos.map((l) => (
                  <div key={l.id} className="card flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-foreground">{l.descricao}</div>
                      <div className="text-xs text-muted">{l.vencimento.toLocaleDateString("pt-BR")}</div>
                    </div>
                    <Money value={Number(l.valor)} className={l.tipo === "RECEITA" ? "text-success" : "text-danger"} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <FileText size={14} /> Propostas
            </h2>
            {cliente.propostas.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma proposta ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cliente.propostas.map((p) => (
                  <div key={p.id} className="card p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{p.titulo}</span>
                      <Badge tone="neutral">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted uppercase">
              <Shield size={14} /> Contratos
            </h2>
            {cliente.documentos.length === 0 ? (
              <p className="text-sm text-muted">Nenhum contrato ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cliente.documentos.map((doc) => (
                  <div key={doc.id} className="card flex items-center justify-between p-3">
                    <span className="text-sm text-foreground">{doc.nome}</span>
                    {doc.arquivoUrl && (
                      <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent-hover">
                        <Paperclip size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
