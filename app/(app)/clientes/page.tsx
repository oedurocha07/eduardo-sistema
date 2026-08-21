import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Money } from "@/app/components/ui/Money";
import { NewClienteForm } from "./NewClienteForm";
import { ClienteCard } from "./ClienteCard";
import { FiltroStatusCliente } from "./FiltroStatusCliente";
import { Users, UserCheck, Wallet, RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic";

function prioridadeFreela(status: string) {
  if (status === "ATIVO") return 0;
  if (status === "PAUSADO") return 1;
  return 2; // ENCERRADO
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const { tipo, status } = await searchParams;
  const filtro: "todos" | "recorrente" | "freela" = tipo === "recorrente" || tipo === "freela" ? tipo : "todos";

  const clientes = await prisma.clienteRecorrente.findMany({
    include: { itensLocados: true },
    orderBy: { nome: "asc" },
  });

  const clientesFiltrados = clientes
    .filter((c) => {
      if (filtro === "recorrente" && !c.recorrente) return false;
      if (filtro === "freela" && c.recorrente) return false;
      if (status && c.status !== status) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = a.recorrente ? 0 : prioridadeFreela(a.status);
      const pb = b.recorrente ? 0 : prioridadeFreela(b.status);
      if (pa !== pb) return pa - pb;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

  const recorrentesAtivos = clientes.filter((c) => c.recorrente && c.status === "ATIVO");
  const freelasEmProgresso = clientes.filter((c) => !c.recorrente && c.status === "ATIVO");
  const mrr = recorrentesAtivos.reduce((s, c) => s + Number(c.valorMensal ?? 0), 0);
  const ultimaSync = clientes
    .map((c) => c.sincronizadoEm)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const TABS: { value: typeof filtro; label: string }[] = [
    { value: "todos", label: `Todos (${clientes.length})` },
    { value: "recorrente", label: `Recorrentes (${clientes.filter((c) => c.recorrente).length})` },
    { value: "freela", label: `Freelance (${clientes.filter((c) => !c.recorrente).length})` },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes"
        subtitle="Cadastre, edite e acompanhe seus clientes — recorrentes ou avulsos — direto aqui."
        action={<NewClienteForm />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clientes recorrentes ativos" value={recorrentesAtivos.length} icon={Users} />
        <StatCard label="Clientes freelance em progresso" value={freelasEmProgresso.length} icon={UserCheck} />
        <StatCard label="Receita recorrente mensal" value={<Money value={mrr} />} icon={Wallet} tone="success" />
        <StatCard
          label="Última sincronização Notion"
          value={ultimaSync ? ultimaSync.toLocaleDateString("pt-BR") : "—"}
          icon={RefreshCcw}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={t.value === "todos" ? "/clientes" : `/clientes?tipo=${t.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filtro === t.value ? "bg-accent/15 text-accent-hover" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <FiltroStatusCliente tipo={filtro} />
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente encontrado" description="Clique em “Novo cliente” para começar." />
      ) : (
        <div className="flex flex-col gap-4">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={{
                ...cliente,
                valorMensal: cliente.valorMensal ? Number(cliente.valorMensal) : null,
                valorTrabalho: cliente.valorTrabalho ? Number(cliente.valorTrabalho) : null,
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
