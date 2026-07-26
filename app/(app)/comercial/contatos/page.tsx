import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { EditContatoButton } from "./EditContatoButton";
import { Contact } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContatosPage() {
  const contatos = await prisma.contato.findMany({
    include: { empresa: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Contatos" subtitle={`${contatos.length} contato${contatos.length === 1 ? "" : "s"}`} />

      {contatos.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Nenhum contato ainda"
          description="Eles aparecem aqui automaticamente quando você cadastra leads."
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {contatos.map((contato) => (
                <tr key={contato.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{contato.nome}</td>
                  <td className="px-4 py-3 text-muted">{contato.empresa.nome}</td>
                  <td className="px-4 py-3 text-muted">{contato.cargo ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{contato.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{contato.telefone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <EditContatoButton
                      contato={{ id: contato.id, nome: contato.nome, cargo: contato.cargo, email: contato.email, telefone: contato.telefone }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
