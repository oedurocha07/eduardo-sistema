import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { NewClienteForm } from "./NewClienteForm";
import { ClienteCard } from "./ClienteCard";
import { Users, Wallet, RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.clienteRecorrente.findMany({
    include: { itensLocados: true },
    orderBy: { nome: "asc" },
  });

  const ativos = clientes.filter((c) => c.status === "ATIVO");
  const mrr = ativos.reduce((s, c) => s + Number(c.valorMensal ?? 0), 0);
  const ultimaSync = clientes
    .map((c) => c.sincronizadoEm)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes Recorrentes"
        subtitle="Cadastre, edite e acompanhe seus clientes fixos direto aqui."
        action={<NewClienteForm />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Clientes ativos" value={ativos.length} icon={Users} />
        <StatCard label="Receita recorrente mensal" value={<Money value={mrr} />} icon={Wallet} tone="success" />
        <StatCard
          label="Última sincronização Notion"
          value={ultimaSync ? ultimaSync.toLocaleDateString("pt-BR") : "—"}
          icon={RefreshCcw}
        />
      </div>

      {clientes.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente cadastrado ainda" description="Clique em “Novo cliente” para começar." />
      ) : (
        <div className="flex flex-col gap-4">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={{
                ...cliente,
                valorMensal: cliente.valorMensal ? Number(cliente.valorMensal) : null,
                itensLocados: cliente.itensLocados.map((i) => ({
                  id: i.id,
                  item: i.item,
                  quantidade: i.quantidade,
                  valorUnitario: Number(i.valorUnitario),
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
