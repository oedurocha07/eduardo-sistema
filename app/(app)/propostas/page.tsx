import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewPropostaForm } from "./NewPropostaForm";
import { PropostaStatusSelect } from "./PropostaStatusSelect";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { FileText, Paperclip, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropostasPage() {
  const [propostas, leads, clientes] = await Promise.all([
    prisma.proposta.findMany({
      include: { lead: { include: { empresa: true } }, cliente: { include: { empresa: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.findMany({ include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Propostas"
        subtitle="Crie, publique e acompanhe propostas comerciais."
        action={
          <NewPropostaForm
            leads={leads.map((l) => ({ id: l.id, label: l.empresa.nome }))}
            clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          />
        }
      />

      {propostas.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta criada ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {propostas.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <Link href={`/propostas/${p.id}`} className="group min-w-0 flex-1">
                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-accent-hover">
                  {p.titulo}
                  {p.arquivoUrl && (
                    <a
                      href={p.arquivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted hover:text-accent-hover"
                      title="Ver anexo"
                    >
                      <Paperclip size={14} />
                    </a>
                  )}
                  <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="text-sm text-muted">
                  {p.lead?.empresa.nome ?? p.cliente?.empresa.nome ?? "—"}
                  {p.valor && (
                    <>
                      {" · "}
                      <Money value={Number(p.valor)} />
                    </>
                  )}
                </div>
              </Link>
              <PropostaStatusSelect id={p.id} status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
