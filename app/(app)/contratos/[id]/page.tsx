import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { EditCofreForm } from "./EditCofreForm";
import { DocumentosCofreSection } from "./DocumentosCofreSection";
import { DeleteCofreButton } from "./DeleteCofreButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CofreDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [cofre, clientesDisponiveis] = await Promise.all([
    prisma.cofreCliente.findUnique({
      where: { id },
      include: { documentos: { orderBy: { createdAt: "desc" } }, cliente: { include: { empresa: true } } },
    }),
    prisma.cliente.findMany({
      where: { ativo: true },
      include: { empresa: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!cofre) notFound();

  return (
    <div className="p-6 md:p-8">
      <Link href="/contratos" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} />
        Voltar para Contratos
      </Link>

      <PageHeader
        eyebrow={cofre.cliente ? `Vinculado a ${cofre.cliente.empresa.nome}` : undefined}
        title={cofre.apelido || cofre.nomeCompleto}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{cofre.tipo === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}</Badge>
            <DeleteCofreButton id={cofre.id} nome={cofre.apelido || cofre.nomeCompleto} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EditCofreForm
          cofreId={cofre.id}
          defaults={{
            tipo: cofre.tipo,
            nomeCompleto: cofre.nomeCompleto,
            apelido: cofre.apelido,
            cpfCnpj: cofre.cpfCnpj,
            responsavel: cofre.responsavel,
            email: cofre.email,
            telefone: cofre.telefone,
            endereco: cofre.endereco,
            cidade: cofre.cidade,
            estado: cofre.estado,
            cep: cofre.cep,
            observacoes: cofre.observacoes,
            clienteId: cofre.clienteId,
          }}
          clientes={clientesDisponiveis.map((c) => ({ id: c.id, label: c.empresa.nome }))}
        />

        <DocumentosCofreSection
          cofreId={cofre.id}
          documentos={cofre.documentos.map((d) => ({ id: d.id, nome: d.nome, descricao: d.descricao, arquivoUrl: d.arquivoUrl }))}
        />
      </div>
    </div>
  );
}
