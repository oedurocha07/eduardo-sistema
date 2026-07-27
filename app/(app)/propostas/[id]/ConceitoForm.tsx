"use client";

import { useTransition } from "react";
import { Film } from "lucide-react";
import { updatePropostaConceito } from "../actions";

export function ConceitoForm({
  propostaId,
  fraseAbertura,
  contextoProjeto,
}: {
  propostaId: string;
  fraseAbertura: string | null;
  contextoProjeto: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updatePropostaConceito(propostaId, formData))}
      className="card flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Film size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Conceito da apresentação</h2>
          <p className="text-xs text-muted">Escolha um tom para o texto ou escreva tudo do seu jeito.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Frase de abertura</label>
        <textarea
          name="fraseAbertura"
          defaultValue={fraseAbertura ?? ""}
          rows={3}
          placeholder="Uma frase curta que resume o espírito do projeto."
          className="input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Contexto do projeto</label>
        <p className="mb-1 text-xs text-muted">
          O ponto de partida: qual o objetivo do projeto e por que essa é a solução certa para o cliente.
        </p>
        <textarea name="contextoProjeto" defaultValue={contextoProjeto ?? ""} rows={8} className="input" />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
