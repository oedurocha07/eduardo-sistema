"use client";

import { useQuickCreate } from "./QuickCreateContext";
import { NewLeadForm } from "./comercial/NewLeadForm";
import { NewLancamentoForm } from "./financeiro/lancamentos/NewLancamentoForm";
import { NewEventoForm } from "./agenda/NewEventoForm";
import { NewClienteForm } from "./clientes/NewClienteForm";
import { NewPropostaForm } from "./propostas/NewPropostaForm";

type Opcao = { id: string; label: string };

export function QuickCreateModals({ leads, clientes }: { leads: Opcao[]; clientes: Opcao[] }) {
  const { aberto, fechar } = useQuickCreate();

  return (
    <>
      <NewLeadForm controlled={{ open: aberto === "lead", onClose: fechar }} />
      <NewLancamentoForm controlled={{ open: aberto === "lancamento", onClose: fechar }} />
      <NewEventoForm controlled={{ open: aberto === "evento", onClose: fechar }} />
      <NewClienteForm controlled={{ open: aberto === "cliente", onClose: fechar }} />
      <NewPropostaForm leads={leads} clientes={clientes} controlled={{ open: aberto === "proposta", onClose: fechar }} />
    </>
  );
}
