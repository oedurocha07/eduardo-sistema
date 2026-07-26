import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { NewCofreForm } from "./NewCofreForm";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Badge } from "@/app/components/ui/Badge";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const [cofres, clientes] = await Promise.all([
    prisma.cofreCliente.findMany({
      include: { documentos: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cliente.findMany({
      where: { ativo: true, cofreCliente: null },
      include: { empresa: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Contratos"
        subtitle="Cada cliente guarda seus dados e contratos num cofre."
        action={<NewCofreForm clientes={clientes.map((c) => ({ id: c.id, label: c.empresa.nome }))} />}
      />

      {cofres.length === 0 ? (
        <EmptyState icon={Shield} title="Nenhum cofre cadastrado ainda" description="Clique em “Novo cofre” para começar." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cofres.map((cofre) => (
            <Link key={cofre.id} href={`/contratos/${cofre.id}`} className="card hover:border-accent/50">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{cofre.apelido || cofre.nomeCompleto}</span>
                <Badge tone="neutral">{cofre.tipo === "FISICA" ? "PF" : "PJ"}</Badge>
              </div>
              <div className="text-sm text-muted">
                {cofre.documentos.length} contrato(s)
                {cofre.documentos[0] && <> · Último: {cofre.documentos[0].createdAt.toLocaleDateString("pt-BR")}</>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
