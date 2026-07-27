"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProjeto } from "../../actions";

export function DeleteProjetoButton({ id, clienteId, nome }: { id: string; clienteId: string; nome: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Apagar o projeto "${nome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(async () => {
            try {
              await deleteProjeto(id, clienteId);
              router.push(`/projetos/${clienteId}`);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erro ao apagar projeto");
            }
          });
        }
      }}
      className="btn-secondary text-danger"
    >
      <Trash2 size={15} />
      Apagar projeto
    </button>
  );
}
