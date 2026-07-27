"use client";

import { useQuickCreate } from "./QuickCreateContext";
import { NewLeadForm } from "./comercial/NewLeadForm";
import { NewLancamentoForm } from "./financeiro/lancamentos/NewLancamentoForm";
import { NewEventoForm } from "./agenda/NewEventoForm";
import { NewClienteForm } from "./clientes/NewClienteForm";
import { NewPropostaForm } from "./propostas/NewPropostaForm";

type Opcao = { id: string; label: string };
type Projeto = { id: string; nome: string; clienteId: string };

export function QuickCreateModals({
  clientesRecorrentes,
  clientes,
  projetos,
}: {
  clientesRecorrentes: Opcao[];
  clientes: Opcao[];
  projetos: Projeto[];
}) {
  const { aberto, fechar } = useQuickCreate();
  const clientesNome = clientes.map((c) => ({ id: c.id, nome: c.label }));

  return (
    <>
      <NewLeadForm controlled={{ open: aberto === "lead", onClose: fechar }} />
      <NewLancamentoForm
        clientes={clientesNome}
        projetos={projetos}
        controlled={{ open: aberto === "lancamento", onClose: fechar }}
      />
      <NewEventoForm controlled={{ open: aberto === "evento", onClose: fechar }} />
      <NewClienteForm controlled={{ open: aberto === "cliente", onClose: fechar }} />
      <NewPropostaForm
        clientesRecorrentes={clientesRecorrentes}
        clientesFreela={clientes}
        controlled={{ open: aberto === "proposta", onClose: fechar }}
      />
    </>
  );
}
