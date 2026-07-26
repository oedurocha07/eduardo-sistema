import { prisma } from "@/app/lib/prisma";
import { NewDocumentoForm } from "./NewDocumentoForm";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Shield, FileText, Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const [documentos, leads, clientes] = await Promise.all([
    prisma.documento.findMany({
      include: { cliente: { include: { empresa: true } }, lead: { include: { empresa: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.findMany({ include: { empresa: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ where: { ativo: true }, include: { empresa: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Contratos"
        subtitle="Contratos e documentos vinculados a leads ou clientes."
        action={
          <NewDocumentoForm
            leads={leads.map((l) => ({ id: l.id, label: l.empresa.nome }))}
            clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))}
          />
        }
      />

      {documentos.length === 0 ? (
        <EmptyState icon={Shield} title="Nenhum contrato cadastrado ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {documentos.map((doc) => (
            <div key={doc.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <FileText size={14} className="text-accent" />
                  {doc.nome}
                  {doc.arquivoUrl && (
                    <a
                      href={doc.arquivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-accent-hover"
                      title="Ver anexo"
                    >
                      <Paperclip size={14} />
                    </a>
                  )}
                </div>
                <div className="text-sm text-muted">
                  {doc.lead?.empresa.nome ?? doc.cliente?.empresa.nome ?? "—"}
                  {doc.descricao && <> · {doc.descricao}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
