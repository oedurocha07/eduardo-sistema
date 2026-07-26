"use client";

import { useTransition } from "react";
import { updateCofre } from "../actions";
import { CofreFormFields } from "../CofreFormFields";

type Opcao = { id: string; label: string };

type Defaults = {
  tipo: string;
  nomeCompleto: string;
  apelido: string | null;
  cpfCnpj: string | null;
  responsavel: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  observacoes: string | null;
  clienteId: string | null;
};

export function EditCofreForm({ cofreId, defaults, clientes }: { cofreId: string; defaults: Defaults; clientes: Opcao[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={(formData) => startTransition(() => updateCofre(cofreId, formData))} className="card">
      <h2 className="mb-3 font-semibold text-foreground">Dados do cofre</h2>
      <CofreFormFields defaults={defaults} clientes={clientes} />
      <button type="submit" disabled={isPending} className="btn-primary mt-4">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
