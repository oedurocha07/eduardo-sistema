"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteLead } from "../../actions";

export function DeleteLeadButton({ id, empresaNome }: { id: string; empresaNome: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Apagar lead"
      onClick={() => {
        if (confirm(`Apagar o lead "${empresaNome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(async () => {
            try {
              await deleteLead(id);
              router.push("/comercial/leads");
            } catch (e) {
              alert(e instanceof Error ? e.message : "Erro ao apagar lead");
            }
          });
        }
      }}
      className="btn-secondary text-danger"
    >
      <Trash2 size={15} />
      Apagar
    </button>
  );
}
